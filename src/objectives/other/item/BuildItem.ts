import DoodadManager from "@wayward/game/game/doodad/DoodadManager";
import type { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import { DoodadTypeGroup } from "@wayward/game/game/doodad/IDoodad";
import UpdateWalkTo from "@wayward/game/game/entity/action/actions/UpdateWalkTo";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";
import Build from "@wayward/game/game/entity/action/actions/Build";
import type Tile from "@wayward/game/game/tile/Tile";
import { VehicleType } from "@wayward/game/game/item/IItem";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IBaseInfo } from "../../../core/ITars";
import { defaultMaxTilesChecked, baseInfo } from "../../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AnalyzeBase from "../../analyze/AnalyzeBase";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import PickUpAllTileItems from "../tile/PickUpAllTileItems";
import UseItem from "./UseItem";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";
import MoveToWater, { MoveToWaterType } from "../../utility/moveTo/MoveToWater";

const recalculateMovements = 40;

export default class BuildItem extends Objective {

	private target: Tile | undefined;
	private movements = 0;

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `BuildItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Building ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid) {
			this.log.warn("Invalid build item");
			return ObjectiveResult.Restart;
		}

		const description = item.description;
		if (!description?.use?.includes(ActionType.Build)) {
			this.log.error(`Invalid build item. ${item}`);
			return ObjectiveResult.Impossible;
		}

		if (!description.onUse) {
			this.log.error(`Invalid build item. ${item}`);
			return ObjectiveResult.Impossible;
		}

		const buildDoodadType = description.onUse[ActionType.Build]?.type;
		if (buildDoodadType === undefined) {
			this.log.error(`Invalid build item. ${item}`);
			return ObjectiveResult.Impossible;
		}

		let moveToTargetObjectives: IObjective[];

		if (item.description?.vehicle?.type === VehicleType.Boat) {
			moveToTargetObjectives = [
				new MoveToWater(MoveToWaterType.SailAwayWater, { disallowBoats: true }),
			];

		} else {
			const baseInfo = this.getBaseInfo(context, buildDoodadType);

			const isWell = DoodadManager.isInGroup(buildDoodadType, DoodadTypeGroup.Well);
			if (isWell) {
				this.log.info("Going build a well");
			}

			if (context.utilities.base.hasBase(context)) {
				if (baseInfo?.tryPlaceNear !== undefined) {
					const nearDoodads = context.base[baseInfo.tryPlaceNear];
					if (nearDoodads.length > 0) {
						const possibleTiles = AnalyzeBase.getNearTilesFromDoodads(context, nearDoodads);
						for (const tile of possibleTiles) {
							if (context.utilities.base.isGoodBuildTile(context, tile, { openAreaRadius: 0 })) {
								this.target = tile;
								break;
							}
						}

						// couldn't find a valid spot for this doodad. lets place it somewhere else
						// it will end up moving the other doodad accordingly
					}
				}

				if (!this.target) {
					const baseTiles = context.utilities.base.getBaseTiles(context);
					for (const baseTile of baseTiles) {
						if (isWell) {
							// look for unlimited wells first
							this.target = baseTile.findMatchingTile(tile => context.utilities.base.isGoodWellBuildTile(context, tile, true), { maxTilesChecked: defaultMaxTilesChecked });
							if (this.target === undefined) {
								this.log.info("Couldn't find unlimited well tile");
								this.target = baseTile.findMatchingTile(tile => context.utilities.base.isGoodWellBuildTile(context, tile, false), { maxTilesChecked: defaultMaxTilesChecked });
							}

						} else {
							this.target = baseTile.findMatchingTile(tile => {
								if (baseInfo && !context.utilities.base.matchesBaseInfo(context, baseInfo, buildDoodadType, tile)) {
									// AnalyzeBase won't like a doodad at this position
									return false;
								}

								return context.utilities.base.isGoodBuildTile(context, tile, baseInfo);
							}, { maxTilesChecked: defaultMaxTilesChecked });
						}

						if (this.target !== undefined) {
							break;
						}
					}
				}

			} else if (!isWell) {
				this.log.info("Looking for build tile...");

				this.target = await context.utilities.base.findInitialBuildTile(context);
			}

			if (this.target === undefined) {
				this.log.info("Unable to find location for build item");
				return ObjectiveResult.Impossible;
			}

			moveToTargetObjectives = [
				new MoveToTarget(this.target, true),
				new PickUpAllTileItems(this.target),
			];
		}

		return [
			...moveToTargetObjectives,
			new UseItem(Build, item),
			new Lambda(async context => {
				const tile = context.human.facingTile;
				if (tile.doodad) {
					context.setData(ContextDataType.LastBuiltDoodad, tile.doodad);
				}

				return ObjectiveResult.Complete;
			}).setStatus(this),
			new AnalyzeBase(),
			new AnalyzeInventory(),
		];
	}

	public override async onMove(context: Context): Promise<boolean | IObjective> {
		this.movements++;

		if (this.movements >= recalculateMovements) {
			// reset the objective and try to find a base spot (again)
			// if the spot to create a base is very far away, the path to it could be huge
			// we might just find a base while moving there!
			this.movements = 0;
			this.target = undefined;

			context.utilities.movement.resetMovementOverlays();

			multiplayer.executeClientside(() => {
				void UpdateWalkTo.execute(context.human, undefined);
			});
		}

		return super.onMove(context);
	}

	private getBaseInfo(context: Context, buildDoodadType: DoodadType): IBaseInfo | undefined {
		for (const [, info] of Object.entries(baseInfo)) {
			if (context.utilities.base.matchesBaseInfo(context, info, buildDoodadType)) {
				return info;
			}
		}

		return undefined;
	}

}
