import DoodadManager from "game/doodad/DoodadManager";
import { DoodadType } from "game/doodad/IDoodad";
import { DoodadTypeGroup } from "game/doodad/IDoodad";
import UpdateWalkPath from "game/entity/action/actions/UpdateWalkPath";
import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Build from "game/entity/action/actions/Build";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IBaseInfo } from "../../../core/ITars";
import { defaultMaxTilesChecked, baseInfo } from "../../../core/ITars";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AnalyzeBase from "../../analyze/AnalyzeBase";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import PickUpAllTileItems from "../tile/PickUpAllTileItems";
import UseItem from "./UseItem";

const recalculateMovements = 40;

export default class BuildItem extends Objective {

	private target: IVector3 | undefined;
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
		if (!item?.isValid()) {
			this.log.warn("Invalid build item");
			return ObjectiveResult.Restart;
		}

		const description = item.description();
		if (!description || !description.use || !description.use.includes(ActionType.Build)) {
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

		const baseInfo = this.getBaseInfo(context, buildDoodadType);

		const isWell = DoodadManager.isInGroup(buildDoodadType, DoodadTypeGroup.Well);
		if (isWell) {
			this.log.info("Going build a well");
		}

		if (context.utilities.base.hasBase(context)) {
			if (baseInfo && baseInfo.tryPlaceNear !== undefined) {
				const nearDoodads = context.base[baseInfo.tryPlaceNear];
				if (nearDoodads.length > 0) {
					const possiblePoints = AnalyzeBase.getNearPointsFromDoodads(nearDoodads);

					for (const point of possiblePoints) {
						if (context.utilities.base.isOpenArea(context, point, context.island.getTileFromPoint(point), 0)) {
							this.target = point;
							break;
						}
					}

					// if (this.target === undefined) {
					// 	// not valid near point by the doodad
					// 	// pick it up so we'll replace it
					// }
				}
			}

			if (!this.target) {
				const baseDoodads = context.utilities.base.getBaseDoodads(context);

				for (const baseDoodad of baseDoodads) {
					if (isWell) {
						// look for unlimited wells first
						this.target = TileHelpers.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, true), { maxTilesChecked: defaultMaxTilesChecked });
						if (this.target === undefined) {
							this.log.info("Couldn't find unlimited well tile");
							this.target = TileHelpers.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodWellBuildTile(context, point, tile, false), { maxTilesChecked: defaultMaxTilesChecked });
						}

					} else {
						this.target = TileHelpers.findMatchingTile(context.island, baseDoodad, (_, point, tile) => {
							if (baseInfo && !context.utilities.base.matchesBaseInfo(context, baseInfo, buildDoodadType, point)) {
								// AnalyzeBase won't affect a doodad at this position
								return false;
							}

							return context.utilities.base.isGoodBuildTile(context, point, tile, baseInfo);
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

		return [
			new MoveToTarget(this.target, true),
			new PickUpAllTileItems(this.target),
			new UseItem(Build, item),
			new Lambda(async context => {
				const tile = context.human.getFacingTile();
				if (tile.doodad) {
					context.setData(ContextDataType.LastBuiltDoodad, tile.doodad);
				}

				return ObjectiveResult.Complete;
			}).setStatus(this),
			new AnalyzeBase(),
		];
	}

	public override async onMove(context: Context) {
		this.movements++;

		if (this.movements >= recalculateMovements) {
			// reset the objective and try to find a base spot (again)
			// if the spot to create a base is very far away, the path to it could be huge
			// we might just find a base while moving there!
			this.movements = 0;
			this.target = undefined;

			context.utilities.movement.resetMovementOverlays();

			multiplayer.executeClientside(() => {
				UpdateWalkPath.execute(context.human, undefined);
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
