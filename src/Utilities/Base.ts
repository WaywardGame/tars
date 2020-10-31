import Doodad from "doodad/Doodad";
import { WorldZ } from "game/WorldZ";
import { IContainer } from "item/IItem";
import { ITile, TerrainType } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context from "../Context";
import { baseInfo, BaseInfoKey } from "../ITars";

import { hasCorpses, isOpenTile } from "./Tile";

const nearBaseDistance = 14;
const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);

export function isGoodBuildTile(context: Context, point: IVector3, tile: ITile, openAreaRadius?: number): boolean {
	if (!isOpenArea(context, point, tile, openAreaRadius)) {
		return false;
	}

	if (!hasBase(context)) {
		// this is the first base item. don't make it on beach sand or gravel
		const tileType = TileHelpers.getType(tile);
		if (tileType === TerrainType.BeachSand || tileType === TerrainType.Gravel) {
			return false;
		}

		return true;
	}

	return isNearBase(context, point);
}

export function isGoodWellBuildTile(context: Context, point: IVector3, tile: ITile, onlyUnlimited: boolean): boolean {
	if (!isGoodBuildTile(context, point, tile)) {
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

export function isOpenArea(context: Context, point: IVector3, tile: ITile, radius: number = 1): boolean {
	if (!isOpenTile(context, point, tile, false) || hasCorpses(tile)) {
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

				if (!isOpenTile(context, nearbyPoint, nearbyTile) || game.isTileFull(nearbyTile)) {
					return false;
				}
			}
		}
	}

	return true;
}

export function getBaseDoodads(context: Context): Doodad[] {
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

export function getBasePosition(context: Context): IVector3 {
	return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player.getPoint();
}

export function hasBase(context: Context): boolean {
	return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
}

export function isNearBase(context: Context, point: IVector3 = context.player): boolean {
	if (!hasBase(context)) {
		return false;
	}

	const baseDoodads = getBaseDoodads(context);

	for (const doodad of baseDoodads) {
		if (Vector2.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
			return true;
		}
	}

	return false;
}

export function getTilesWithItemsNearBase(context: Context): { tiles: IVector3[]; totalCount: number } {
	const result: { tiles: IVector3[]; totalCount: number } = {
		tiles: [],
		totalCount: 0,
	};

	const tiles = TileHelpers.tilesInRange(context.player, nearBaseDistance, true);
	for (const [point, tile] of tiles) {
		const containedItems = tile.containedItems;
		if (!containedItems || containedItems.length === 0) {
			continue;
		}

		result.totalCount += containedItems.length;
		result.tiles.push(point);
	}

	return result;
}
