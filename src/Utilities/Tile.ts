import { ITile, ITileContainer, TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import { IVector3 } from "utilities/math/IVector";

import Context from "../Context";
import { ITileLocation } from "../ITars";
import Navigation from "../navigation/Navigation";

class TileUtilities {

	private cache: Map<string, ITileLocation[]> = new Map();

	public clearCache() {
		this.cache.clear();
	}

	public async getNearestTileLocation(contextOrPosition: Context | IVector3, tileType: TerrainType): Promise<ITileLocation[]> {
		// const position = contextOrPosition instanceof Context ? contextOrPosition.getPosition() : contextOrPosition;
		const position = contextOrPosition instanceof Context ? contextOrPosition.player : contextOrPosition;

		const results: ITileLocation[][] = [];

		// for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
		const z = position.z;

		const cacheId = `${tileType},${position.x},${position.y},${z}`;

		let result = this.cache.get(cacheId);
		if (!result) {
			result = await Navigation.get().getNearestTileLocation(tileType, { x: position.x, y: position.y, z: z });
			this.cache.set(cacheId, result);
		}

		results.push(result);
		// }

		return results.flat();
	}

	public isSwimmingOrOverWater(context: Context) {
		return context.player.isSwimming() || Terrains[TileHelpers.getType(game.getTileFromPoint(context.getPosition()))]?.water === true;
	}

	public isOverDeepSeaWater(context: Context) {
		return TileHelpers.getType(game.getTileFromPoint(context.getPosition())) === TerrainType.DeepSeawater;
		// return Terrains[TileHelpers.getType(game.getTileFromPoint(context.getPosition()))]?.deepWater === true;
	}

	public isOpenTile(context: Context, point: IVector3, tile: ITile, allowWater: boolean = true): boolean {
		if (game.isTileFull(tile)) {
			return false;
		}

		if (tile.doodad) {
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

		return this.isFreeOfOtherPlayers(context, point);
	}

	public isFreeOfOtherPlayers(context: Context, point: IVector3) {
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

	public canGather(tile: ITile, skipDoodadCheck?: boolean) {
		if (!skipDoodadCheck && !Terrains[TileHelpers.getType(tile)]?.gather && (tile.doodad || this.hasItems(tile))) {
			return false;
		}

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !game.isPlayerAtTile(tile, false, true);
	}

	public canDig(tile: ITile) {
		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !this.hasItems(tile) && !game.isPlayerAtTile(tile, false, true);
	}

	public canCarveCorpse(tile: ITile, skipCorpseCheck?: boolean) {
		return (skipCorpseCheck || this.hasCorpses(tile))
			&& !tile.creature && !tile.npc && !this.hasItems(tile) && !game.isPlayerAtTile(tile, false, true) && !tileEventManager.blocksTile(tile);
	}

	public hasCorpses(tile: ITile) {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: ITile) {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

}

export const tileUtilities = new TileUtilities();
