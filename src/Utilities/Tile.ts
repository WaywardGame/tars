import { IContainer } from "item/IItem";
import { ITile, TerrainType } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";

import Context from "../Context";
import { ITileLocation } from "../ITars";
import Navigation from "../Navigation/Navigation";

const cache: Map<string, ITileLocation[]> = new Map();

export function resetNearestTileLocationCache() {
	cache.clear();
}

export async function getNearestTileLocation(tileType: TerrainType, position: IVector3): Promise<ITileLocation[]> {
	const cacheId = `${tileType},${position.x},${position.y}${position.z}`;

	let result = cache.get(cacheId);
	if (!result) {
		result = await Navigation.get().getNearestTileLocation(tileType, position);
		cache.set(cacheId, result);
	}

	return result;
}

export function isSwimming(context: Context) {
	const tile = game.getTileFromPoint(context.getPosition());
	const terrainType = TileHelpers.getType(tile);
	const terrainInfo = Terrains[terrainType];
	return terrainInfo && terrainInfo.water === true && context.player.raft === undefined;
}

export function isOpenTile(context: Context, point: IVector3, tile: ITile, allowWater: boolean = true): boolean {
	if (tile.creature !== undefined) {
		return false;
	}

	if (tile.doodad !== undefined) {
		return false;
	}

	const terrainType = TileHelpers.getType(tile);
	const terrainInfo = Terrains[terrainType];
	if (terrainInfo) {
		if (!terrainInfo.passable && !terrainInfo.water) {
			return false;
		}

		if (!allowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
			return false;
		}
	}

	return isFreeOfOtherPlayers(context, point);
}

export function isFreeOfOtherPlayers(context: Context, point: IVector3) {
	const players = game.getPlayersAtPosition(point.x, point.y, point.z, false, true);
	if (players.length > 0) {
		for (const player of players) {
			if (player !== context.player) {
				return false;
			}
		}
	}

	return true;
}

export function canGather(tile: ITile) {
	const terrainDescription = Terrains[TileHelpers.getType(tile)]!;
	if (!terrainDescription.gather && (tile.doodad || (tile as IContainer).containedItems)) {
		return false;
	}

	if (tile.creature !== undefined || tile.npc !== undefined || hasCorpses(tile) || game.isPlayerAtTile(tile, false, true)) {
		return false;
	}

	return true;
}

export function hasCorpses(tile: ITile) {
	return !!(tile.corpses && tile.corpses.length);
}
