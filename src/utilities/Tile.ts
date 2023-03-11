import { IContainer } from "game/item/IItem";
import type { ITileContainer } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import type { IVector3 } from "utilities/math/IVector";
import Dig from "game/entity/action/actions/Dig";
import Butcher from "game/entity/action/actions/Butcher";
import Till from "game/entity/action/actions/Till";

import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";
import Item from "game/item/Item";
import { Direction } from "utilities/math/Direction";
import { WaterType } from "game/island/IIsland";
import Tile from "game/tile/Tile";
import { ExtendedTerrainType } from "src/core/navigation/INavigation";

export interface IOpenTileOptions {
	requireNoItemsOnTile: boolean;
	disallowWater: boolean;
	requireInfiniteShallowWater: boolean;
}

export class TileUtilities {

	private readonly tileLocationCache: Map<string, ITileLocation[]> = new Map();
	private readonly canUseArgsCache: Map<string, { point: IVector3; direction: Direction.Cardinal } | null> = new Map();

	public clearCache() {
		this.tileLocationCache.clear();
		this.canUseArgsCache.clear();
	}

	public getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, positionOverride?: IVector3): ITileLocation[] {
		const position = positionOverride ?? context.getTile();

		const results: ITileLocation[][] = [
			this._getNearestTileLocation(context, tileType, position)
		];

		if (!positionOverride && context.options.allowCaves) {
			const oppositeOrigin = context.utilities.navigation.calculateOppositeOrigin(position.z);
			// const oppositeOrigin = context.utilities.navigation.getOppositeOrigin();
			if (oppositeOrigin) {
				results.push(this._getNearestTileLocation(context, tileType, oppositeOrigin));
			}
		}

		return results.flat();
	}

	private _getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, position: IVector3): ITileLocation[] {
		const cacheId = `${tileType},${position.x},${position.y},${position.z}`;

		let result = this.tileLocationCache.get(cacheId);
		if (!result) {
			result = context.utilities.navigation.getNearestTileLocation(context.island, tileType, position);
			this.tileLocationCache.set(cacheId, result);
		}

		return result;
	}

	public isSwimmingOrOverWater(context: Context) {
		const tile = context.getTile();
		return context.human.isSwimming() || (tile && Terrains[tile.type]?.water === true);
	}

	public isOverDeepSeaWater(context: Context) {
		return context.getTile()?.type === TerrainType.DeepSeawater;
		// return Terrains[game.getTileFromPoint(context.getPosition(.type))]?.deepWater === true;
	}

	public isOpenTile(context: Context, tile: Tile, options?: Partial<IOpenTileOptions>): boolean {
		if (options?.requireNoItemsOnTile) {
			const container = tile as IContainer;
			if (container.containedItems && container.containedItems.length > 0) {
				return false;
			}

		} else if (tile.isFull) {
			return false;
		}

		if (tile.doodad) {
			return false;
		}

		const terrainType = tile.type;
		if (terrainType === TerrainType.CaveEntrance || terrainType === TerrainType.Lava || terrainType === TerrainType.CoolingLava) {
			return false;
		}

		const terrainInfo = Terrains[terrainType];
		if (terrainInfo) {
			if (!terrainInfo.passable && !terrainInfo.water) {
				return false;
			}

			if (options?.requireInfiniteShallowWater) {
				// don't make solar still over fresh or swap water
				if (!terrainInfo.shallowWater || terrainInfo.freshWater || terrainInfo.swampWater) {
					return false;
				}

				if (context.island.checkWaterFill(tile, 50, WaterType.None) < 50) {
					return false;
				}

			} else if (options?.disallowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
				return false;
			}
		}

		return this.isFreeOfOtherPlayers(context, tile);
	}

	public isFreeOfOtherPlayers(context: Context, tile: Tile) {
		const players = tile.getPlayersOnTile(false, true);
		if (players.length > 0) {
			for (const player of players) {
				if (player !== context.human) {
					return false;
				}
			}
		}

		return true;
	}

	public canGather(context: Context, tile: Tile, skipDoodadCheck?: boolean) {
		if (!skipDoodadCheck && !Terrains[tile.type]?.gather && (tile.doodad || this.hasItems(tile))) {
			return false;
		}

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.isPlayerOnTile(false, true);
	}

	public canDig(context: Context, tile: Tile) {
		const canUseArgs = this.getCanUseArgs(context, tile);
		if (!canUseArgs) {
			return false;
		}

		return Dig.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction).usable;
	}

	public canTill(context: Context, tile: Tile, tool: Item | undefined, allowedTilesSet: Set<TerrainType>): boolean {
		const canUseArgs = this.getCanUseArgs(context, tile);
		if (!canUseArgs) {
			return false;
		}

		// default to any item in the inventory just so ItemNearby is satisfied
		tool ??= context.human.inventory.containedItems[0];

		const canUse = Till.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool);
		if (!canUse.usable) {
			return false;
		}

		// digging grass will reveal dirt
		if (!allowedTilesSet.has(canUse.isGrass ? TerrainType.Dirt : canUse.tileType)) {
			return false;
		}

		return context.utilities.base.isOpenArea(context, tile);
	}

	public canButcherCorpse(context: Context, tile: Tile, tool: Item | undefined) {
		const canUseArgs = this.getCanUseArgs(context, tile);
		if (!canUseArgs) {
			return false;
		}

		// default to any item in the inventory just so ItemNearby is satisfied
		tool ??= context.human.inventory.containedItems[0];

		return Butcher.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool).usable;
	}

	public hasCorpses(tile: Tile) {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: Tile) {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

	private getCanUseArgs(context: Context, tile: Tile): { point: IVector3; direction: Direction.Cardinal } | null {
		const cacheId = `${tile.x},${tile.y},${tile.z}`;

		let result = this.canUseArgsCache.get(cacheId);
		if (result === undefined) {
			const endPositions = context.utilities.movement.getMovementEndPositions(context, tile, true);
			if (endPositions.length !== 0) {
				const point = endPositions[0];
				const direction = context.island.getDirectionFromMovement(tile.x - point.x, tile.y - point.y);

				result = { point, direction };

			} else {
				result = null;
			}

			this.canUseArgsCache.set(cacheId, result);
		}

		return result;
	}
}
