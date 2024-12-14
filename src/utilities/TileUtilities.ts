import Butcher from "@wayward/game/game/entity/action/actions/Butcher";
import Dig from "@wayward/game/game/entity/action/actions/Dig";
import Till from "@wayward/game/game/entity/action/actions/Till";
import type { IContainer, ItemType } from "@wayward/game/game/item/IItem";
import type { ITileContainer } from "@wayward/game/game/tile/ITerrain";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import type { IVector3 } from "@wayward/game/utilities/math/IVector";

import { WaterType } from "@wayward/game/game/island/IIsland";
import type Item from "@wayward/game/game/item/Item";
import type Tile from "@wayward/game/game/tile/Tile";
import type { Direction } from "@wayward/game/utilities/math/Direction";
import type { IActionNotUsable } from "@wayward/game/game/entity/action/IAction";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import type { ITillCanUse } from "@wayward/game/game/entity/action/actions/ToggleTilled";
import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";

import { gardenMaxTilesChecked } from "../objectives/other/tile/TillForSeed";
import type { ITileLocation } from "../core/ITars";
import type Context from "../core/context/Context";
import type { ExtendedTerrainType } from "../core/navigation/INavigation";

export interface IOpenTileOptions {
	requireNoItemsOnTile: boolean;
	disallowWater: boolean;
	requireInfiniteShallowWater: boolean;
}

export class TileUtilities {

	private readonly seedAllowedTileSet = new Map<ItemType, Set<TerrainType>>();
	private readonly tileLocationCache = new Map<string, ITileLocation[]>();
	private readonly canUseArgsCache = new Map<number, { point: IVector3; direction: Direction.Cardinal } | null>();
	private readonly canUseResultCache = new Map<number, IActionNotUsable | ITillCanUse>();
	private readonly nearbyTillableTile = new Map<ItemType, Tile | undefined | null>();

	public clearCache(): void {
		this.seedAllowedTileSet.clear();
		this.tileLocationCache.clear();
		this.canUseArgsCache.clear();
		this.canUseResultCache.clear();
		this.nearbyTillableTile.clear();
	}

	public getNearestTileLocation(context: Context, tileType: ExtendedTerrainType, tileOverride?: Tile): ITileLocation[] {
		const tile = tileOverride ?? context.getTile();

		const results: ITileLocation[][] = [
			this._getNearestTileLocation(context, tileType, tile),
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

	public getSeedAllowedTileSet(seedItemType: ItemType): Set<TerrainType> {
		let tileSet = this.seedAllowedTileSet.get(seedItemType);
		if (tileSet === undefined) {
			tileSet = new Set(doodadDescriptions[itemDescriptions[seedItemType]?.onUse?.[ActionType.Plant]!]?.allowedTiles ?? []);
			this.seedAllowedTileSet.set(seedItemType, tileSet);
		}

		return tileSet;
	}

	public getNearbyTillableTile(context: Context, seedItemType: ItemType, allowedTilesSet: Set<TerrainType>): Tile | undefined {
		let result = this.nearbyTillableTile.get(seedItemType);
		if (result === undefined) {
			result = context.utilities.base.getBaseTile(context).findMatchingTile(
				tile => context.utilities.tile.canTill(context, tile, context.inventory.hoe, allowedTilesSet),
				{
					maxTilesChecked: gardenMaxTilesChecked,
				},
			);

			this.nearbyTillableTile.set(seedItemType, result ? result : null);
		}

		return result ? result : undefined;
	}

	public canGather(context: Context, tile: Tile, skipDoodadCheck?: boolean): boolean {
		if (!skipDoodadCheck && !tile.description?.gather && (tile.doodad || this.hasItems(tile))) {
			return false;
		}

		return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.isPlayerOnTile() && !tile.isDeepHole;
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

		let canUse = this.canUseResultCache.get(tile.id);
		if (canUse === undefined) {
			canUse = Till.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool);
			this.canUseResultCache.set(tile.id, canUse);
		}

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
		return !!(tile.corpses?.length);
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
