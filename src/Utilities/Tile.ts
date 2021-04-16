import { ITile, ITileContainer, TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";
import Context from "../Context";
import { ITileLocation } from "../ITars";
import Navigation from "../Navigation/Navigation";


const cache: Map<string, ITileLocation[]> = new Map();

export function resetNearestTileLocationCache() {
	cache.clear();
}

export async function getNearestTileLocation(contextOrPosition: Context | IVector3, tileType: TerrainType): Promise<ITileLocation[]> {
	// const position = contextOrPosition instanceof Context ? contextOrPosition.getPosition() : contextOrPosition;
	const position = contextOrPosition instanceof Context ? contextOrPosition.player : contextOrPosition;

	const results: ITileLocation[][] = [];

	// for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
	const z = position.z;

	const cacheId = `${tileType},${position.x},${position.y},${z}`;

	let result = cache.get(cacheId);
	if (!result) {
		result = await Navigation.get().getNearestTileLocation(tileType, { x: position.x, y: position.y, z: z });
		cache.set(cacheId, result);
		results.push(result);
	}
	// }

	return results.flat();
}

export function isOverWater(context: Context) {
	const tile = game.getTileFromPoint(context.getPosition());
	const terrainType = TileHelpers.getType(tile);
	const terrainInfo = Terrains[terrainType];
	return terrainInfo && terrainInfo.water === true;
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

export function canGather(tile: ITile, skipDoodadCheck?: boolean) {
	if (!skipDoodadCheck && !Terrains[TileHelpers.getType(tile)]?.gather && (tile.doodad || hasItems(tile))) {
		return false;
	}

	return !hasCorpses(tile) && !tile.creature && !tile.npc && !game.isPlayerAtTile(tile, false, true);
}

export function canDig(tile: ITile) {
	return !hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !hasItems(tile) && !game.isPlayerAtTile(tile, false, true);
}

export function canCarveCorpse(tile: ITile, skipCorpseCheck?: boolean) {
	return (skipCorpseCheck || hasCorpses(tile))
		&& !tile.creature && !tile.npc && !hasItems(tile) && !game.isPlayerAtTile(tile, false, true) && !tileEventManager.blocksTile(tile);
}

export function hasCorpses(tile: ITile) {
	return !!(tile.corpses && tile.corpses.length);
}

export function hasItems(tile: ITile) {
	const tileContainer = tile as ITileContainer;
	return tileContainer.containedItems && tileContainer.containedItems.length > 0;
}
