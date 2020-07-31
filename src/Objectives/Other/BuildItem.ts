import Doodad from "doodad/Doodad";
import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";
import Item from "item/Item";
import { TerrainType } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { baseInfo, BaseInfoKey, defaultMaxTilesChecked, IBaseInfo } from "../../ITars";
import Objective from "../../Objective";
import * as Base from "../../Utilities/Base";
import * as movementUtilities from "../../Utilities/Movement";
import { FindObjectType, getSortedObjects } from "../../Utilities/Object";
import { getNearestTileLocation } from "../../Utilities/Tile";
import AnalyzeBase from "../Analyze/AnalyzeBase";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";

import UseItem from "./UseItem";

const recalculateMovements = 40;

const nearRocksDistance = Math.pow(24, 2);

const nearSeawaterDistance = Math.pow(24, 2);

export default class BuildItem extends Objective {

	private target: IVector3 | undefined;
	private movements = 0;

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `BuildItem:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item || context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			this.log.error("Invalid build item");
			return ObjectiveResult.Restart;
		}

		const description = item.description();
		if (!description || !description.use || description.use.indexOf(ActionType.Build) === -1) {
			this.log.error("Invalid build item", item);
			return ObjectiveResult.Impossible;
		}

		if (!description.onUse || !description.onUse[ActionType.Build] === undefined) {
			this.log.error("Invalid build item", item);
			return ObjectiveResult.Impossible;
		}

		const buildDoodadType = description.onUse[ActionType.Build] as DoodadType;

		const baseInfo = this.getBaseInfo(buildDoodadType);

		const isWell = doodadManager.isInGroup(buildDoodadType, DoodadTypeGroup.Well);
		if (isWell) {
			this.log.info("Going build a well");
		}

		if (Base.hasBase(context)) {
			if (baseInfo && baseInfo.tryPlaceNear !== undefined) {
				const nearDoodads = context.base[baseInfo.tryPlaceNear];
				const possiblePoints = AnalyzeBase.getNearPoints(nearDoodads);

				for (const point of possiblePoints) {
					if (Base.isOpenArea(context, point, game.getTileFromPoint(point), 0)) {
						this.target = point;
						break;
					}
				}
			}

			if (!this.target) {
				const baseDoodads = Base.getBaseDoodads(context);

				for (const baseDoodad of baseDoodads) {
					if (isWell) {
						// look for unlimited wells first
						this.target = TileHelpers.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodWellBuildTile(context, point, tile, true), defaultMaxTilesChecked);
						if (this.target === undefined) {
							this.log.info("Couldn't find unlimited well tile");
							this.target = TileHelpers.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodWellBuildTile(context, point, tile, false), defaultMaxTilesChecked);
						}

					} else {
						this.target = TileHelpers.findMatchingTile(baseDoodad, (point, tile) => Base.isGoodBuildTile(context, point, tile), defaultMaxTilesChecked);
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
			new UseItem(ActionType.Build, item),
			new Lambda(async context => {
				const tile = context.player.getFacingTile();
				if (tile.doodad) {
					context.setData(ContextDataType.LastBuiltDoodad, tile.doodad);
				}

				return ObjectiveResult.Complete;
			}),
		];
	}

	public async onMove(context: Context) {
		this.movements++;

		if (this.movements >= recalculateMovements) {
			// reset the objective and try to find a base spot (again)
			// if the spot to create a base is very far away, the path to it could be huge
			// we might just find a base while moving there!
			this.movements = 0;
			this.target = undefined;

			movementUtilities.resetMovementOverlays();
			context.player.walkAlongPath(undefined);
		}

		return super.onMove(context);
	}

	private getBaseInfo(buildDoodadType: DoodadType): IBaseInfo | undefined {
		const keys = Object.keys(baseInfo) as BaseInfoKey[];
		for (const key of keys) {
			const info = baseInfo[key];
			if (AnalyzeBase.matchesBaseInfo(info, buildDoodadType)) {
				return info;
			}
		}

		return undefined;
	}

	private async findInitialBuildTile(context: Context): Promise<IVector3 | undefined> {
		const facingPoint = context.player.getFacingPoint();
		const facingTile = context.player.getFacingTile();

		if (await this.isGoodTargetOrigin(context, facingPoint) && Base.isGoodBuildTile(context, facingPoint, facingTile)) {
			return facingPoint;
		}

		const sortedObjects = getSortedObjects(context, FindObjectType.Doodad, island.doodads as Doodad[]);

		for (const doodad of sortedObjects) {
			if (doodad !== undefined && doodad.z === context.player.z) {
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

							const tile = game.getTileFromPoint(point);

							if (Base.isGoodBuildTile(context, point, tile)) {
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
		let tree = 0;
		let grass = 0;
		// let openTiles = 0;

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

				const tile = game.getTileFromPoint(point);
				if (tile.doodad) {
					const description = tile.doodad.description();
					if (description && description.isTree) {
						tree++;
					}

				} else if (Base.isGoodBuildTile(context, point, tile)) {
					const tileType = TileHelpers.getType(tile);
					if (tileType === TerrainType.Grass) {
						grass++;
					}
				}
			}
		}

		if (grass < 20 || tree < 6) {
			return false;
		}

		// build close to rocks
		const rockTileLocations = await getNearestTileLocation(TerrainType.Rocks, origin);
		const sandstoneTileLocations = await getNearestTileLocation(TerrainType.Sandstone, origin);

		if (rockTileLocations.every(tileLocation => Vector2.squaredDistance(tileLocation.point, origin) > nearRocksDistance) &&
			sandstoneTileLocations.every(tileLocation => Vector2.squaredDistance(tileLocation.point, origin) > nearRocksDistance)) {
			return false;
		}

		// buiuld close to a water source
		const shallowSeawaterTileLocations = await getNearestTileLocation(TerrainType.ShallowSeawater, origin);
		if (shallowSeawaterTileLocations.every(tileLocation => Vector2.squaredDistance(tileLocation.point, origin) > nearSeawaterDistance)) {
			return false;
		}

		return true;
	}

}
