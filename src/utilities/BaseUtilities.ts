import type Doodad from "@wayward/game/game/doodad/Doodad";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import Vector2 from "@wayward/game/utilities/math/Vector2";
import type Creature from "@wayward/game/game/entity/creature/Creature";
import type Item from "@wayward/game/game/item/Item";
import { BiomeType } from "@wayward/game/game/biome/IBiome";
import { WaterType } from "@wayward/game/game/island/IIsland";

import type Context from "../core/context/Context";
import type { BaseInfoKey, IBaseInfo } from "../core/ITars";
import { baseInfo } from "../core/ITars";
import { FindObjectType } from "./ObjectUtilities";
import DoodadManager from "@wayward/game/game/doodad/DoodadManager";
import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import type { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import type Tile from "@wayward/game/game/tile/Tile";
import { nearBaseDataKeys } from "../core/context/IContext";

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

	private tilesNearBaseCache: Tile[] | undefined;

	public clearCache(): void {
		this.tilesNearBaseCache = undefined;
	}

	public canBuildWaterDesalinators(context: Context): boolean {
		return context.island.biomeType !== BiomeType.IceCap;
	}

	public isGoodBuildTile(context: Context, tile: Tile, options?: Partial<IBuildTileOptions>): boolean {
		const tileType = tile.type;
		if (tileType === TerrainType.Swamp) {
			// don't build on swamp tiles
			return false;
		}

		if (!this.isOpenArea(context, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
			return false;
		}

		let good = false;

		if (this.hasBase(context)) {
			good = this.isNearBase(context, tile, options?.nearBaseDistanceSq, true);

		} else {
			// this is the first base item. don't make it on beach sand or gravel
			if (tileType === TerrainType.BeachSand || tileType === TerrainType.Gravel) {
				return false;
			}

			good = true;
		}

		if (good && this.isTreasureChestLocation(context, tile)) {
			// these are cursed spots
			good = false;
		}

		return good;
	}

	public isGoodWellBuildTile(context: Context, tile: Tile, onlyUnlimited: boolean): boolean {
		if (!this.isGoodBuildTile(context, tile)) {
			return false;
		}

		const well = context.island.calculateWell(tile);
		if (well.waterType !== WaterType.FreshWater && well.waterType !== WaterType.Seawater) {
			return false;
		}

		return onlyUnlimited ? well.quantity === -1 : false;
	}

	public isOpenArea(context: Context, tile: Tile, radius: number = 1, allowWater: boolean = false, requireShallowWater: boolean = false): boolean {
		if (!context.utilities.tile.isOpenTile(context, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireInfiniteShallowWater: requireShallowWater }) ||
			context.utilities.tile.hasCorpses(tile)) {
			return false;
		}

		if (radius > 0) {
			for (let x = -radius; x <= radius; x++) {
				for (let y = -radius; y <= radius; y++) {
					if (x === 0 && y === 0) {
						continue;
					}

					const nearbyTile = context.island.getTileSafe(tile.x + x, tile.y + y, tile.z);
					if (!nearbyTile) {
						continue;
					}

					if (!context.utilities.tile.isOpenTile(context, nearbyTile, { disallowWater: !requireShallowWater, requireNoItemsOnTile: false })) {
						return false;
					}
				}
			}
		}

		return true;
	}

	public getBaseTiles(context: Context): Set<Tile> {
		const tiles = new Set<Tile>();

		const keys = Object.keys(baseInfo) as BaseInfoKey[];
		for (const key of keys) {
			const baseDoodadOrDoodads = context.base[key];
			if (Array.isArray(baseDoodadOrDoodads)) {
				for (const doodad of baseDoodadOrDoodads) {
					tiles.add(doodad.tile);
				}
			}
		}

		return tiles;
	}

	public isBaseDoodad(context: Context, doodad: Doodad): boolean {
		return this.getBaseTiles(context).has(doodad.tile);
	}

	public getBaseTile(context: Context): Tile {
		return (context.base.campfire[0] || context.base.dripStone[0] || context.base.waterStill[0] || context.base.kiln[0])?.tile ?? context.human.tile;
	}

	public hasBase(context: Context): boolean {
		return context.base.campfire.length > 0 || context.base.dripStone.length > 0 || context.base.waterStill.length > 0;
	}

	public isNearBase(context: Context, tile: Tile = context.human.tile, distanceSq: number = nearBaseDistanceSq, skipNearBaseOverride = false): boolean {
		if (!skipNearBaseOverride && nearBaseDataKeys.some(nearBaseDataKey => context.hasData(nearBaseDataKey))) {
			// we were doing some near base stuff, keep at it!
			return true;
		}

		if (!this.hasBase(context)) {
			return false;
		}

		const baseTiles = this.getBaseTiles(context);
		for (const baseTile of baseTiles) {
			if (baseTile.z === tile.z && (distanceSq === Infinity || Vector2.squaredDistance(baseTile, tile) <= distanceSq)) {
				return true;
			}
		}

		return false;
	}

	public getTilesNearBase(context: Context): Tile[] {
		const baseTile = this.getBaseTile(context);

		this.tilesNearBaseCache ??= baseTile.findMatchingTiles(
			() => true,
			{
				canVisitTile: tile => this.isNearBase(context, tile, undefined, true),
			},
		);

		return this.tilesNearBaseCache;
	}

	public getTilesWithItemsNearBase(context: Context): { tiles: Tile[]; totalCount: number } {
		const result: { tiles: Tile[]; totalCount: number } = {
			tiles: [],
			totalCount: 0,
		};

		for (const tile of this.getTilesNearBase(context)) {
			const containedItems = tile.containedItems;
			if (!containedItems || containedItems.length === 0) {
				continue;
			}

			result.totalCount += containedItems.length;
			result.tiles.push(tile);
		}

		return result;
	}

	public getTileItemsNearBase(context: Context): Item[] {
		let result: Item[] = [];

		for (const tile of this.getTilesNearBase(context)) {
			const containedItems = tile.containedItems;
			if (!containedItems || containedItems.length === 0) {
				continue;
			}

			result = result.concat(containedItems);
		}

		return result;
	}

	public getSwampTilesNearBase(context: Context): Tile[] {
		return this.getTilesNearBase(context).filter(tile => tile.type === TerrainType.Swamp);
	}

	public getNonTamedCreaturesNearBase(context: Context): Creature[] {
		const result: Creature[] = [];

		for (const tile of this.getTilesNearBase(context)) {
			if (tile.creature && !tile.creature.isTamed) {
				result.push(tile.creature);
			}
		}

		return result;
	}

	public getWaterSourceDoodads(context: Context): Doodad[] {
		return context.base.dripStone.concat(context.base.waterStill).concat(context.base.solarStill);
	}

	public isTreasureChestLocation(context: Context, tile: Tile): boolean {
		return context.island.treasureMaps
			.some(drawnMap => drawnMap.getTreasure()
				.some(treasure => treasure.x === tile.x && treasure.y === tile.y && drawnMap.position.z === tile.z));
	}

	public matchesBaseInfo(context: Context, info: IBaseInfo, doodadType: DoodadType, tile?: Tile): boolean {
		const doodadDescription = doodadDescriptions[doodadType];
		if (!doodadDescription) {
			return false;
		}

		if (tile && info.tryPlaceNear !== undefined) {
			const placeNearDoodads = context.base[info.tryPlaceNear];

			// reject doodads that won't be able to be near the desired type
			const isValid = AnalyzeBase.getNearTiles(context, tile)
				.some(nearTile => {
					// check if the nearby doodad matches desired one
					if (nearTile.doodad && (placeNearDoodads.includes(nearTile.doodad) || this.matchesBaseInfo(context, baseInfo[info.tryPlaceNear!], nearTile.doodad.type))) {
						// nearby doodad is there
						return true;
					}

					if (context.utilities.base.isOpenArea(context, nearTile, 0)) {
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

					if (doodadDescription.group?.includes(doodadTypeOrGroup)) {
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

	public async findInitialBuildTile(context: Context): Promise<Tile | undefined> {
		const desiredOriginTile = context.island.isDefaultIsland ? context.island.getSpawnPoint() : context.human.tile;
		// context.island.zones.all().sort

		// const facingTile = context.human.facingTile;

		if (await this.isGoodTargetOrigin(context, desiredOriginTile) && context.utilities.base.isGoodBuildTile(context, desiredOriginTile)) {
			return desiredOriginTile;
		}

		const sortedObjects = context.utilities.object.getSortedObjects(context, FindObjectType.Doodad, context.island.doodads.getObjects() as Doodad[], desiredOriginTile);

		for (const doodad of sortedObjects) {
			if (doodad !== undefined && doodad.z === context.human.z) {
				const description = doodad.description;
				if (description && description.isTree && await this.isGoodTargetOrigin(context, doodad.tile)) {
					for (let x = -6; x <= 6; x++) {
						for (let y = -6; y <= 6; y++) {
							if (x === 0 && y === 0) {
								continue;
							}

							const tile = context.island.getTileSafe(doodad.x + x, doodad.y + y, doodad.z);
							if (!tile) {
								continue;
							}

							if (context.utilities.base.isGoodBuildTile(context, tile)) {
								return tile;
							}
						}
					}
				}
			}
		}
	}

	private async isGoodTargetOrigin(context: Context, origin: Tile): Promise<boolean> {
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

				const tile = context.island.getTileSafe(origin.x + x, origin.y + y, origin.z);
				if (!tile) {
					continue;
				}

				if (tile.doodad) {
					const description = tile.doodad.description;
					if (description?.isTree) {
						nearbyTrees++;
					}

				} else if (context.utilities.base.isGoodBuildTile(context, tile)) {
					if (tile.type === commonTerrainType) {
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
			const rockTileLocations = context.utilities.tile.getNearestTileLocation(context, rockType, origin);
			if (rockTileLocations.some(tileLocation => Vector2.squaredDistance(origin, tileLocation.tile) <= nearRocksDistance)) {
				foundRock = true;
				break;
			}
		}

		if (!foundRock) {
			return false;
		}

		// buiuld close to a water source
		const shallowSeawaterTileLocations = context.utilities.tile.getNearestTileLocation(context, waterType, origin);
		if (shallowSeawaterTileLocations.every(tileLocation => Vector2.squaredDistance(origin, tileLocation.tile) > nearWaterDistance)) {
			return false;
		}

		return true;
	}
}
