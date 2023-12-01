/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Butcher from "@wayward/game/game/entity/action/actions/Butcher";
import Dig from "@wayward/game/game/entity/action/actions/Dig";
import Till from "@wayward/game/game/entity/action/actions/Till";
import { IContainer } from "@wayward/game/game/item/IItem";
import type { ITileContainer } from "@wayward/game/game/tile/ITerrain";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";

import { WaterType } from "@wayward/game/game/island/IIsland";
import Item from "@wayward/game/game/item/Item";
import Tile from "@wayward/game/game/tile/Tile";
import { Direction } from "@wayward/game/utilities/math/Direction";
import type { ITileLocation } from "../core/ITars";
import Context from "../core/context/Context";
import { ExtendedTerrainType } from "../core/navigation/INavigation";

export interface IOpenTileOptions {
	requireNoItemsOnTile: boolean;
	disallowWater: boolean;
	requireInfiniteShallowWater: boolean;
}

export class TileUtilities {

	private readonly tileLocationCache: Map<string, ITileLocation[]> = new Map();
	private readonly canUseArgsCache: Map<number, { point: IVector3; direction: Direction.Cardinal } | null> = new Map();

	public clearCache(): void {
		this.tileLocationCache.clear();
		this.canUseArgsCache.clear();
	}

	public getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, tileOverride?: Tile): ITileLocation[] {
		const tile = tileOverride ?? context.getTile();

		const results: ITileLocation[][] = [
			this._getNearestTileLocation(context, tileType, tile)
		];

		if (!tileOverride && context.options.allowCaves) {
			const oppositeOrigin = context.utilities.navigation.calculateOppositeOrigin(tile.z);
			// const oppositeOrigin = context.utilities.navigation.getOppositeOrigin();
			if (oppositeOrigin) {
				results.push(this._getNearestTileLocation(context, tileType, oppositeOrigin));
			}
		}

		return results.flat();
	}

	private _getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, tile: Tile): ITileLocation[] {
		const cacheId = `${tileType},${tile.id}`;

		let result = this.tileLocationCache.get(cacheId);
		if (!result) {
			result = context.utilities.navigation.getNearestTileLocation(context.island, tileType, tile);
			this.tileLocationCache.set(cacheId, result);
		}

		return result;
	}

	public isSwimmingOrOverWater(context: Context): boolean {
		const tile = context.getTile();
		return context.human.isSwimming || tile?.description?.water === true;
	}

	public isOverDeepSeaWater(context: Context): boolean {
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

		const terrainDescription = tile.description;
		if (terrainDescription) {
			if (!terrainDescription.passable && !terrainDescription.water) {
				return false;
			}

			if (terrainDescription.preventBuilding) {
				return false;
			}

			if (options?.requireInfiniteShallowWater) {
				// don't make solar still over fresh or swap water
				if (!terrainDescription.shallowWater || terrainDescription.freshWater || terrainDescription.swampWater) {
					return false;
				}

				if (context.island.checkWaterFill(tile, 50, WaterType.None).count < 50) {
					return false;
				}

			} else if (options?.disallowWater && (terrainDescription.water || terrainDescription.shallowWater)) {
				return false;
			}
		}

		return this.isFreeOfOtherPlayers(context, tile);
	}

	public isFreeOfOtherPlayers(context: Context, tile: Tile): boolean {
		const players = tile.getPlayersOnTile();
		if (players.length > 0) {
			for (const player of players) {
				if (player !== context.human) {
					return false;
				}
			}
		}

		return true;
	}

	public canGather(context: Context, tile: Tile, skipDoodadCheck?: boolean): boolean {
		if (!skipDoodadCheck && !tile.description?.gather && (tile.doodad || this.hasItems(tile))) {
			return false;
		}

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.isPlayerOnTile();
	}

	public canDig(context: Context, tile: Tile): boolean {
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

	public canButcherCorpse(context: Context, tile: Tile, tool: Item | undefined): boolean {
		const canUseArgs = this.getCanUseArgs(context, tile);
		if (!canUseArgs) {
			return false;
		}

		// default to any item in the inventory just so ItemNearby is satisfied
		tool ??= context.human.inventory.containedItems[0];

		return Butcher.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool).usable;
	}

	public hasCorpses(tile: Tile): boolean {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: Tile): boolean {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

	private getCanUseArgs(context: Context, tile: Tile): { point: IVector3; direction: Direction.Cardinal } | null {
		let result = this.canUseArgsCache.get(tile.id);
		if (result === undefined) {
			const endPositions = context.utilities.movement.getMovementEndPositions(context, tile, true);
			if (endPositions.length !== 0) {
				const point = endPositions[0];
				const direction = context.island.getDirectionFromMovement(tile.x - point.x, tile.y - point.y);

				result = { point, direction };

			} else {
				result = null;
			}

			this.canUseArgsCache.set(tile.id, result);
		}

		return result;
	}
}
