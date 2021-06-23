import Doodad from "game/doodad/Doodad";
import { IContainer } from "game/item/IItem";
import { ITile, TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import { WorldZ } from "game/WorldZ";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import Creature from "game/entity/creature/Creature";
import Item from "game/item/Item";
import { BiomeType } from "game/biome/IBiome";

import Context from "../Context";
import { baseInfo, BaseInfoKey } from "../ITars";
import { tileUtilities } from "./Tile";

const nearBaseDistance = 14;
const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);

class BaseUtilities {

	private tilesNearBaseCache: Array<{ point: IVector3; tile: ITile; }> | undefined;

	public clearCache() {
		this.tilesNearBaseCache = undefined;
	}

	public shouldBuildWaterStills(context: Context) {
		return island.biomeType !== BiomeType.IceCap;
	}

	public isGoodBuildTile(context: Context, point: IVector3, tile: ITile, openAreaRadius?: number): boolean {
		if (!this.isOpenArea(context, point, tile, openAreaRadius)) {
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

		return this.isNearBase(context, point);
	}

	public isGoodWellBuildTile(context: Context, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean {
		if (!this.isGoodBuildTile(context, point, tile)) {
			return false;
		}

		const x = point.x;
		const y = point.y;

		const caveTerrain = Terrains[TileHelpers.getType(game.getTile(x, y, WorldZ.Cave))];
		if (caveTerrain && (caveTerrain.water || caveTerrain.shallowWater)) {
			// unlimited fresh water
			return true;
		}

		if (onlyUnlimited) {
			return false;
		}

		if (caveTerrain && !caveTerrain.passable) {
			// fresh water
			return true;
		}

		for (let x2 = x - 6; x2 <= x + 6; x2++) {
			for (let y2 = y - 6; y2 <= y + 6; y2++) {
				const validPoint = game.ensureValidPoint({ x: x2, y: y2, z: point.z });
				if (validPoint) {
					const tileDescription = Terrains[TileHelpers.getType(game.getTileFromPoint(validPoint))];
					if (tileDescription && (tileDescription.water && !tileDescription.freshWater)) {
						// seawater
						return true;
					}
				}
			}
		}

		return false;
	}

	public isOpenArea(context: Context, point: IVector3, tile: ITile, radius: number = 1): boolean {
		if (!tileUtilities.isOpenTile(context, point, tile, false) || tileUtilities.hasCorpses(tile)) {
			return false;
		}

		if (radius > 0) {
			for (let x = -radius; x <= radius; x++) {
				for (let y = -radius; y <= radius; y++) {
					const nearbyPoint: IVector3 = {
						x: point.x + x,
						y: point.y + y,
						z: point.z,
					};

					if (!game.ensureValidPoint(nearbyPoint)) {
						continue;
					}

					const nearbyTile = game.getTileFromPoint(nearbyPoint);
					if (nearbyTile.doodad) {
						return false;
					}

					const container = tile as IContainer;
					if (container.containedItems && container.containedItems.length > 0) {
						return false;
					}

					if (!tileUtilities.isOpenTile(context, nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
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

	public isBaseDoodad(context: Context, doodad: Doodad): boolean {
		return this.getBaseDoodads(context).includes(doodad);
	}

	public getBasePosition(context: Context): IVector3 {
		return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player.getPoint();
	}

	public hasBase(context: Context): boolean {
		return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
	}

	public isNearBase(context: Context, point: IVector3 = context.player): boolean {
		if (!this.hasBase(context)) {
			return false;
		}

		const baseDoodads = this.getBaseDoodads(context);

		for (const doodad of baseDoodads) {
			if (Vector2.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
				return true;
			}
		}

		return false;
	}

	public getTilesNearBase(context: Context) {
		const basePosition = this.getBasePosition(context);

		this.tilesNearBaseCache ??= TileHelpers.findMatchingTiles(
			basePosition,
			() => true,
			{
				canVisitTile: (point) => this.isNearBase(context, point),
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

	public getCreaturesNearBase(context: Context): Creature[] {
		const result: Creature[] = [];

		for (const { tile } of this.getTilesNearBase(context)) {
			if (tile.creature && !tile.creature.isTamed()) {
				result.push(tile.creature);
			}
		}

		return result;
	}
}

export const baseUtilities = new BaseUtilities();

