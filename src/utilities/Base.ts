import type Doodad from "game/doodad/Doodad";
import type { ITile } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import type Creature from "game/entity/creature/Creature";
import type Item from "game/item/Item";
import { BiomeType } from "game/biome/IBiome";

import type Context from "../core/context/Context";
import type { BaseInfoKey } from "../core/ITars";
import { baseInfo } from "../core/ITars";
import { WaterType } from "game/island/IIsland";

const nearBaseDistance = 14;
const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);

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
		if (!this.isOpenArea(context, point, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
			return false;
		}

		if (!this.hasBase(context)) {
			// this is the first base item. don't make it on beach sand or gravel
			const tileType = TileHelpers.getType(tile);
			if (tileType === TerrainType.BeachSand || tileType === TerrainType.Gravel) {
				return false;
			}

			return true;
		}

		return this.isNearBase(context, point, options?.nearBaseDistanceSq);
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
		if (!context.utilities.tile.isOpenTile(context, point, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireShallowWater }) ||
			context.utilities.tile.hasCorpses(tile)) {
			return false;
		}

		if (radius > 0) {
			for (let x = -radius; x <= radius; x++) {
				for (let y = -radius; y <= radius; y++) {
					if (x === 0 && y === 0) {
						continue;
					}

					const nearbyPoint: IVector3 = {
						x: point.x + x,
						y: point.y + y,
						z: point.z,
					};

					if (!context.island.ensureValidPoint(nearbyPoint)) {
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
			if (doodad.z === point.z && Vector2.squaredDistance(doodad, point) <= distanceSq) {
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
}
