import type Doodad from "game/doodad/Doodad";
import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import type Creature from "game/entity/creature/Creature";
import type Item from "game/item/Item";
import { BiomeType } from "game/biome/IBiome";
import { WaterType } from "game/island/IIsland";

import type Context from "../core/context/Context";
import type { BaseInfoKey, IBaseInfo } from "../core/ITars";
import { baseInfo } from "../core/ITars";
import { FindObjectType } from "./Object";
import DoodadManager from "game/doodad/DoodadManager";
import doodadDescriptions from "game/doodad/Doodads";
import { DoodadType } from "game/doodad/IDoodad";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";

const nearBaseDistance = 14;
const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);

const nearRocksDistance = Math.pow(24, 2);

const nearWaterDistance = Math.pow(24, 2);

export interface IBuildTileOptions {
	openAreaRadius: number;
	allowWater: boolean;
	requireShallowWater: boolean;
	nearBaseDistanceSq: number;
}

export class BaseUtilities {

	private tilesNearBaseCache: Array<{ point: IVector3; tile: ITile }> | undefined;

	public clearCache() {
		this.tilesNearBaseCache = undefined;
	}

	public shouldBuildWaterStills(context: Context) {
		return context.island.biomeType !== BiomeType.IceCap;
	}

	public isGoodBuildTile(context: Context, point: IVector3, tile: ITile, options?: Partial<IBuildTileOptions>): boolean {
		const tileType = TileHelpers.getType(tile);
		if (tileType === TerrainType.Swamp) {
			// don't build on swamp tiles
			return false;
		}

		if (!this.isOpenArea(context, point, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
			return false;
		}

		let good = false;

		if (this.hasBase(context)) {
			good = this.isNearBase(context, point, options?.nearBaseDistanceSq);

		} else {
			// this is the first base item. don't make it on beach sand or gravel
			if (tileType === TerrainType.BeachSand || tileType === TerrainType.Gravel) {
				return false;
			}

			good = true;
		}

		if (good && this.isTreasureChestLocation(context, point)) {
			// these are cursed spots
			good = false;
		}

		return good;
	}

	public isGoodWellBuildTile(context: Context, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean {
		if (!this.isGoodBuildTile(context, point, tile)) {
			return false;
		}

		const well = context.island.calculateWell(point);
		if (well.waterType !== WaterType.FreshWater && well.waterType !== WaterType.Seawater) {
			return false;
		}

		return onlyUnlimited ? well.quantity === -1 : false;
	}

	public isOpenArea(context: Context, point: IVector3, tile: ITile, radius: number = 1, allowWater: boolean = false, requireShallowWater: boolean = false): boolean {
		if (!context.utilities.tile.isOpenTile(context, point, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireInfiniteShallowWater: requireShallowWater }) ||
			context.utilities.tile.hasCorpses(tile)) {
			return false;
		}

		if (radius > 0) {
			for (let x = -radius; x <= radius; x++) {
				for (let y = -radius; y <= radius; y++) {
					if (x === 0 && y === 0) {
						continue;
					}

					const nearbyPoint = context.island.ensureValidPoint({
						x: point.x + x,
						y: point.y + y,
						z: point.z,
					});
					if (!nearbyPoint) {
						continue;
					}

					const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
					if (!context.utilities.tile.isOpenTile(context, nearbyPoint, nearbyTile, { disallowWater: !requireShallowWater, requireNoItemsOnTile: false })) {
						return false;
					}
				}
			}
		}

		return true;
	}

	public getBaseDoodads(context: Context): Doodad[] {
		let doodads: Doodad[] = [];

		const keys = Object.keys(baseInfo) as BaseInfoKey[];
		for (const key of keys) {
			const baseDoodadOrDoodads: Doodad | Doodad[] = context.base[key];
			if (Array.isArray(baseDoodadOrDoodads)) {
				doodads = doodads.concat(baseDoodadOrDoodads);

			} else {
				doodads.push(baseDoodadOrDoodads);
			}
		}

		return doodads;
	}

	public isBaseTile(context: Context, tile: ITile): boolean {
		return tile.doodad ? this.isBaseDoodad(context, tile.doodad) : false;
	}

	public isBaseDoodad(context: Context, doodad: Doodad): boolean {
		return this.getBaseDoodads(context).includes(doodad);
	}

	public getBasePosition(context: Context): IVector3 {
		return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.human.getPoint();
	}

	public hasBase(context: Context): boolean {
		return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
	}

	public isNearBase(context: Context, point: IVector3 = context.human, distanceSq: number = nearBaseDistanceSq): boolean {
		if (!this.hasBase(context)) {
			return false;
		}

		const baseDoodads = this.getBaseDoodads(context);

		for (const doodad of baseDoodads) {
			if (doodad.z === point.z && (distanceSq === Infinity || Vector2.squaredDistance(doodad, point) <= distanceSq)) {
				return true;
			}
		}

		return false;
	}

	public getTilesNearBase(context: Context) {
		const basePosition = this.getBasePosition(context);

		this.tilesNearBaseCache ??= TileHelpers.findMatchingTiles(
			context.island,
			basePosition,
			() => true,
			{
				canVisitTile: (island, point) => this.isNearBase(context, point),
			},
		);

		return this.tilesNearBaseCache;
	}

	public getTilesWithItemsNearBase(context: Context): { tiles: IVector3[]; totalCount: number } {
		const result: { tiles: IVector3[]; totalCount: number } = {
			tiles: [],
			totalCount: 0,
		};

		for (const { point, tile } of this.getTilesNearBase(context)) {
			const containedItems = tile.containedItems;
			if (!containedItems || containedItems.length === 0) {
				continue;
			}

			result.totalCount += containedItems.length;
			result.tiles.push(point);
		}

		return result;
	}

	public getTileItemsNearBase(context: Context): Item[] {
		let result: Item[] = [];

		for (const { tile } of this.getTilesNearBase(context)) {
			const containedItems = tile.containedItems;
			if (!containedItems || containedItems.length === 0) {
				continue;
			}

			result = result.concat(containedItems);
		}

		return result;
	}

	public getSwampTilesNearBase(context: Context): IVector3[] {
		const result: IVector3[] = [];

		for (const { point, tile } of this.getTilesNearBase(context)) {
			if (TileHelpers.getType(tile) === TerrainType.Swamp) {
				result.push(point);
			}
		}

		return result;
	}

	public getNonTamedCreaturesNearBase(context: Context): Creature[] {
		const result: Creature[] = [];

		for (const { tile } of this.getTilesNearBase(context)) {
			if (tile.creature && !tile.creature.isTamed()) {
				result.push(tile.creature);
			}
		}

		return result;
	}

	public isTreasureChestLocation(context: Context, point: IVector3): boolean {
		return context.island.treasureMaps
			.some(drawnMap => drawnMap.getTreasure()
				.some(treasure => treasure.x === point.x && treasure.y === point.y && drawnMap.position.z === point.z));
	}

	public matchesBaseInfo(context: Context, info: IBaseInfo, doodadType: DoodadType, point?: IVector3): boolean {
		const doodadDescription = doodadDescriptions[doodadType];
		if (!doodadDescription) {
			return false;
		}

		if (point && info.tryPlaceNear !== undefined) {
			const placeNearDoodads = context.base[info.tryPlaceNear];

			// reject doodads that won't be able to be near the desired type
			const isValid = AnalyzeBase.getNearPoints(point)
				.some((point) => {
					const tile = context.island.getTileFromPoint(point);

					// check if the nearby doodad matches desired one
					if (tile.doodad && (placeNearDoodads.includes(tile.doodad) || this.matchesBaseInfo(context, baseInfo[info.tryPlaceNear!], tile.doodad.type))) {
						// nearby doodad is there
						return true;
					}

					if (context.utilities.base.isOpenArea(context, point, tile, 0)) {
						// there is an open spot for the other doodad
						return true;
					}

					return false;
				});
			if (!isValid) {
				return false;
			}
		}

		if (info.doodadTypes) {
			for (const doodadTypeOrGroup of info.doodadTypes) {
				if (DoodadManager.isGroup(doodadTypeOrGroup)) {
					if (DoodadManager.isInGroup(doodadType, doodadTypeOrGroup)) {
						return true;
					}

					if (doodadDescription.group && doodadDescription.group.includes(doodadTypeOrGroup)) {
						return true;
					}

				} else if (doodadTypeOrGroup === doodadType) {
					return true;
				}
			}
		}

		if (info.litType !== undefined && doodadDescription.lit !== undefined) {
			const litDescription = doodadDescriptions[doodadDescription.lit];
			if (litDescription && DoodadManager.isInGroup(doodadDescription.lit, info.litType)) {
				return true;
			}
		}

		return false;
	}

	public async findInitialBuildTile(context: Context): Promise<IVector3 | undefined> {
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

							const point = context.island.ensureValidPoint({
								x: doodad.x + x,
								y: doodad.y + y,
								z: doodad.z,
							});
							if (!point) {
								continue;
							}

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
		let rockTypes: Set<TerrainType>;
		let waterType: TerrainType;
		let treeRequirementCount = 6;

		switch (context.island.biomeType) {
			case BiomeType.Coastal:
				commonTerrainType = TerrainType.Grass;
				rockTypes = new Set([TerrainType.Granite]);
				waterType = TerrainType.ShallowSeawater;
				break;

			case BiomeType.IceCap:
				commonTerrainType = TerrainType.Snow;
				rockTypes = new Set([TerrainType.GraniteWithSnow]);
				waterType = TerrainType.FreezingSeawater;
				break;

			case BiomeType.Arid:
				commonTerrainType = TerrainType.DesertSand;
				rockTypes = new Set([TerrainType.Sandstone]);
				waterType = TerrainType.ShallowSeawater;
				treeRequirementCount = 3;
				break;

			case BiomeType.Wetlands:
				commonTerrainType = TerrainType.Spikerush;
				rockTypes = new Set([TerrainType.Granite, TerrainType.GraniteGround]);
				waterType = TerrainType.ShallowSeawater;
				treeRequirementCount = 3;
				break;

			case BiomeType.Volcanic:
				commonTerrainType = TerrainType.BasaltGround;
				rockTypes = new Set([TerrainType.Basalt]);
				waterType = TerrainType.ShallowSeawater;
				treeRequirementCount = 3;
				break;

			default:
				commonTerrainType = TerrainType.Dirt;
				rockTypes = new Set([TerrainType.Granite]);
				waterType = TerrainType.ShallowSeawater;
				break;
		}

		for (let x = -6; x <= 6; x++) {
			for (let y = -6; y <= 6; y++) {
				if (x === 0 && y === 0) {
					continue;
				}

				const point = context.island.ensureValidPoint({
					x: origin.x + x,
					y: origin.y + y,
					z: origin.z,
				});
				if (!point) {
					continue;
				}

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
		let foundRock = false;
		for (const rockType of rockTypes) {
			const rockTileLocations = await context.utilities.tile.getNearestTileLocation(context, rockType, origin);
			if (rockTileLocations.some(tileLocation => Vector2.squaredDistance(origin, tileLocation.point) <= nearRocksDistance)) {
				foundRock = true;
				break;
			}
		}

		if (!foundRock) {
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
