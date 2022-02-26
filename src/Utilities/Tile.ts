import { IContainer } from "game/item/IItem";
import type { ITile, ITileContainer } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";

import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";

export interface IOpenTileOptions {
	requireNoItemsOnTile: boolean;
	disallowWater: boolean;
	requireShallowWater: boolean;
}

export class TileUtilities {

	private readonly cache: Map<string, ITileLocation[]> = new Map();

	public clearCache() {
		this.cache.clear();
	}

	public async getNearestTileLocation(context: Context, tileType: TerrainType, positionOverride?: IVector3): Promise<ITileLocation[]> {
		const position = positionOverride ?? (context.options.fasterPlanning ? context.getPosition() : context.human);

		const results: ITileLocation[][] = [
			await this._getNearestTileLocation(context, tileType, position)
		];

		// assuming opposite origin is in a cave
		if (!positionOverride && context.options.allowCaves) {
			const oppositeOrigin = context.utilities.navigation.getOppositeOrigin();
			if (oppositeOrigin && oppositeOrigin.z !== position.z) {
				results.push(await this._getNearestTileLocation(context, tileType, oppositeOrigin));
			}
		}

		return results.flat();
	}

	private async _getNearestTileLocation(context: Context, tileType: TerrainType, position: IVector3): Promise<ITileLocation[]> {
		const cacheId = `${tileType},${position.x},${position.y},${position.z}`;

		let result = this.cache.get(cacheId);
		if (!result) {
			result = await context.utilities.navigation.getNearestTileLocation(tileType, position);
			this.cache.set(cacheId, result);
		}

		return result;
	}

	public isSwimmingOrOverWater(context: Context) {
		return context.human.isSwimming() || Terrains[TileHelpers.getType(context.human.island.getTileFromPoint(context.getPosition()))]?.water === true;
	}

	public isOverDeepSeaWater(context: Context) {
		return TileHelpers.getType(context.human.island.getTileFromPoint(context.getPosition())) === TerrainType.DeepSeawater;
		// return Terrains[TileHelpers.getType(game.getTileFromPoint(context.getPosition()))]?.deepWater === true;
	}

	public isOpenTile(context: Context, point: IVector3, tile: ITile, options?: Partial<IOpenTileOptions>): boolean {
		if (options?.requireNoItemsOnTile) {
			const container = tile as IContainer;
			if (container.containedItems && container.containedItems.length > 0) {
				return false;
			}

		} else if (context.human.island.isTileFull(tile)) {
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

			if (options?.requireShallowWater) {
				if (!terrainInfo.shallowWater) {
					return false;
				}

			} else if (options?.disallowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
				return false;
			}
		}

		return this.isFreeOfOtherPlayers(context, point);
	}

	public isFreeOfOtherPlayers(context: Context, point: IVector3) {
		const players = context.human.island.getPlayersAtPosition(point.x, point.y, point.z, false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (player !== context.human) {
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

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !context.human.island.isPlayerAtTile(tile, false, true);
	}

	public canDig(context: Context, tile: ITile) {
		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !this.hasItems(tile) && !context.human.island.isPlayerAtTile(tile, false, true);
	}

	public canButcherCorpse(context: Context, tile: ITile, skipCorpseCheck?: boolean) {
		return (skipCorpseCheck || this.hasCorpses(tile))
			&& !tile.creature && !tile.npc && !this.hasItems(tile) && !context.human.island.isPlayerAtTile(tile, false, true) && !context.human.island.tileEvents.blocksTile(tile);
	}

	public hasCorpses(tile: ITile) {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: ITile) {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

}
