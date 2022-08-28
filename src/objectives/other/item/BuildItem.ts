import { BiomeType } from "game/biome/IBiome";
import type Doodad from "game/doodad/Doodad";
import DoodadManager from "game/doodad/DoodadManager";
import { DoodadType } from "game/doodad/IDoodad";
import { DoodadTypeGroup } from "game/doodad/IDoodad";
import UpdateWalkPath from "game/entity/action/actions/UpdateWalkPath";
import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import { TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Build from "game/entity/action/actions/Build";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IBaseInfo } from "../../../core/ITars";
import { defaultMaxTilesChecked, baseInfo } from "../../../core/ITars";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { FindObjectType } from "../../../utilities/Object";
import AnalyzeBase from "../../analyze/AnalyzeBase";
import Lambda from "../../core/Lambda";
import MoveToTarget from "../../core/MoveToTarget";
import PickUpAllTileItems from "../tile/PickUpAllTileItems";
import UseItem from "./UseItem";

const recalculateMovements = 40;

const nearRocksDistance = Math.pow(24, 2);

const nearWaterDistance = Math.pow(24, 2);

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
						this.target = TileHelpers.findMatchingTile(context.island, baseDoodad, (_, point, tile) => context.utilities.base.isGoodBuildTile(context, point, tile, baseInfo), { maxTilesChecked: defaultMaxTilesChecked });
					}

					if (this.target !== undefined) {
						break;
					}
				}
			}

		} else if (!isWell) {
			this.log.info("Looking for build tile...");

			this.target = await this.findInitialBuildTile(context);
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
			if (AnalyzeBase.matchesBaseInfo(context, info, buildDoodadType)) {
				return info;
			}
		}

		return undefined;
	}

	private async findInitialBuildTile(context: Context): Promise<IVector3 | undefined> {
		const facingPoint = context.human.getFacingPoint();
		const facingTile = context.human.getFacingTile();

		if (await this.isGoodTargetOrigin(context, facingPoint) && context.utilities.base.isGoodBuildTile(context, facingPoint, facingTile)) {
			return facingPoint;
		}

		const sortedObjects = context.utilities.object.getSortedObjects(context, FindObjectType.Doodad, context.island.doodads.getObjects() as Doodad[]);

		for (const doodad of sortedObjects) {
			if (doodad !== undefined && doodad.z === context.human.z) {
				const description = doodad.description();
				if (description && description.isTree && await this.isGoodTargetOrigin(context, doodad)) {
					for (let x = -6; x <= 6; x++) {
						for (let y = -6; y <= 6; y++) {
							if (x === 0 && y === 0) {
								continue;
							}

							const point: IVector3 = {
								x: doodad.x + x,
								y: doodad.y + y,
								z: doodad.z,
							};

							const tile = context.island.getTileFromPoint(point);

							if (context.utilities.base.isGoodBuildTile(context, point, tile)) {
								return point;
							}
						}
					}
				}
			}
		}
	}

	private async isGoodTargetOrigin(context: Context, origin: IVector3): Promise<boolean> {
		// build our base near trees, grass, and open tiles
		let nearbyTrees = 0;
		let nearbyCommonTiles = 0;
		// let openTiles = 0;

		let commonTerrainType: TerrainType;
		let rockType: TerrainType;
		let waterType: TerrainType;
		let treeRequirementCount = 6;

		switch (context.island.biomeType) {
			case BiomeType.Coastal:
				commonTerrainType = TerrainType.Grass;
				rockType = TerrainType.Granite;
				waterType = TerrainType.ShallowSeawater;
				break;

			case BiomeType.IceCap:
				commonTerrainType = TerrainType.Snow;
				rockType = TerrainType.GraniteWithSnow;
				waterType = TerrainType.FreezingSeawater;
				break;

			case BiomeType.Arid:
				commonTerrainType = TerrainType.DesertSand;
				rockType = TerrainType.Sandstone;
				waterType = TerrainType.ShallowSeawater;
				treeRequirementCount = 3;
				break;

			default:
				commonTerrainType = TerrainType.Dirt;
				rockType = TerrainType.Granite;
				waterType = TerrainType.ShallowSeawater;
				break;
		}

		for (let x = -6; x <= 6; x++) {
			for (let y = -6; y <= 6; y++) {
				if (x === 0 && y === 0) {
					continue;
				}

				const point: IVector3 = {
					x: origin.x + x,
					y: origin.y + y,
					z: origin.z,
				};

				const tile = context.island.getTileFromPoint(point);
				if (tile.doodad) {
					const description = tile.doodad.description();
					if (description && description.isTree) {
						nearbyTrees++;
					}

				} else if (context.utilities.base.isGoodBuildTile(context, point, tile)) {
					if (TileHelpers.getType(tile) === commonTerrainType) {
						nearbyCommonTiles++;
					}
				}
			}
		}

		if (nearbyCommonTiles < 20 || nearbyTrees < treeRequirementCount) {
			return false;
		}

		// build close to rocks
		const rockTileLocations = await context.utilities.tile.getNearestTileLocation(context, rockType, origin);
		if (rockTileLocations.every(tileLocation => Vector2.squaredDistance(origin, tileLocation.point) > nearRocksDistance)) {
			return false;
		}

		// buiuld close to a water source
		const shallowSeawaterTileLocations = await context.utilities.tile.getNearestTileLocation(context, waterType, origin);
		if (shallowSeawaterTileLocations.every(tileLocation => Vector2.squaredDistance(origin, tileLocation.point) > nearWaterDistance)) {
			return false;
		}

		return true;
	}

}