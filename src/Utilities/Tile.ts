import { IContainer } from "game/item/IItem";
import type { ITile, ITileContainer } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";

import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";

export class TileUtilities {

	private readonly cache: Map<string, ITileLocation[]> = new Map();

	public clearCache() {
		this.cache.clear();
	}

	public async getNearestTileLocation(context: Context, tileType: TerrainType, positionOverride?: IVector3): Promise<ITileLocation[]> {
		const position = positionOverride ?? context.player;

		const results: ITileLocation[][] = [];

		// for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
		const z = position.z;

		const cacheId = `${tileType},${position.x},${position.y},${z}`;

		let result = this.cache.get(cacheId);
		if (!result) {
			result = await context.utilities.navigation.getNearestTileLocation(tileType, { x: position.x, y: position.y, z: z });
			this.cache.set(cacheId, result);
		}

		results.push(result);
		// }

		return results.flat();
	}

	public isSwimmingOrOverWater(context: Context) {
		return context.player.isSwimming() || Terrains[TileHelpers.getType(context.player.island.getTileFromPoint(context.getPosition()))]?.water === true;
	}

	public isOverDeepSeaWater(context: Context) {
		return TileHelpers.getType(context.player.island.getTileFromPoint(context.getPosition())) === TerrainType.DeepSeawater;
		// return Terrains[TileHelpers.getType(game.getTileFromPoint(context.getPosition()))]?.deepWater === true;
	}

	public isOpenTile(context: Context, point: IVector3, tile: ITile, allowWater: boolean = true, requireShallowWater: boolean = false): boolean {
		const container = tile as IContainer;
		if (container.containedItems && container.containedItems.length > 0) {
			return false;
		}

		if (tile.doodad) {
			return false;
		}

		const terrainType = TileHelpers.getType(tile);
		if (terrainType === TerrainType.CaveEntrance || terrainType === TerrainType.Lava || terrainType === TerrainType.CoolingLava) {
			return false;
		}

		const terrainInfo = Terrains[terrainType];
		if (terrainInfo) {
			if (!terrainInfo.passable && !terrainInfo.water) {
				return false;
			}

			if (requireShallowWater) {
				if (!terrainInfo.shallowWater) {
					return false;
				}

			} else if (!allowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
				return false;
			}
		}

		return this.isFreeOfOtherPlayers(context, point);
	}

	public isFreeOfOtherPlayers(context: Context, point: IVector3) {
		const players = context.player.island.getPlayersAtPosition(point.x, point.y, point.z, false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (player !== context.player) {
					return false;
				}
			}
		}

		return true;
	}

	public canGather(context: Context, tile: ITile, skipDoodadCheck?: boolean) {
		if (!skipDoodadCheck && !Terrains[TileHelpers.getType(tile)]?.gather && (tile.doodad || this.hasItems(tile))) {
			return false;
		}

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !context.player.island.isPlayerAtTile(tile, false, true);
	}

	public canDig(context: Context, tile: ITile) {
		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !this.hasItems(tile) && !context.player.island.isPlayerAtTile(tile, false, true);
	}

	public canButcherCorpse(context: Context, tile: ITile, skipCorpseCheck?: boolean) {
		return (skipCorpseCheck || this.hasCorpses(tile))
			&& !tile.creature && !tile.npc && !this.hasItems(tile) && !context.player.island.isPlayerAtTile(tile, false, true) && !context.player.island.tileEvents.blocksTile(tile);
	}

	public hasCorpses(tile: ITile) {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: ITile) {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

}
