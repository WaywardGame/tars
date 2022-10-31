import { IContainer } from "game/item/IItem";
import type { ITile, ITileContainer } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import TileHelpers from "utilities/game/TileHelpers";
import type { IVector3 } from "utilities/math/IVector";
import Dig from "game/entity/action/actions/Dig";
import Butcher from "game/entity/action/actions/Butcher";
import Till from "game/entity/action/actions/Till";

import Context from "../core/context/Context";
import type { ITileLocation } from "../core/ITars";
import Item from "game/item/Item";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";
import { Direction } from "utilities/math/Direction";
import { WaterType } from "game/island/IIsland";

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

	public getNearestTileLocation(context: Context, tileType: TerrainType, positionOverride?: IVector3): ITileLocation[] {
		const position = positionOverride ?? context.getPosition();

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

	private _getNearestTileLocation(context: Context, tileType: TerrainType, position: IVector3): ITileLocation[] {
		const cacheId = `${tileType},${position.x},${position.y},${position.z}`;

		let result = this.tileLocationCache.get(cacheId);
		if (!result) {
			result = context.utilities.navigation.getNearestTileLocation(context.island, tileType, position);
			this.tileLocationCache.set(cacheId, result);
		}

		return result;
	}

	public isSwimmingOrOverWater(context: Context) {
		const tile = context.human.island.getTileFromPoint(context.getPosition());
		return context.human.isSwimming() || (tile && Terrains[TileHelpers.getType(tile)]?.water === true);
	}

	public isOverDeepSeaWater(context: Context) {
		const tile = context.human.island.getTileFromPoint(context.getPosition());
		return tile && TileHelpers.getType(tile) === TerrainType.DeepSeawater;
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

			if (options?.requireInfiniteShallowWater) {
				// don't make solar still over fresh or swap water
				if (!terrainInfo.shallowWater || terrainInfo.freshWater || terrainInfo.swampWater) {
					return false;
				}

				if (context.island.checkWaterFill(point.x, point.y, point.z, 50, WaterType.None) < 50) {
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

	public canDig(context: Context, tilePosition: IVector3) {
		const canUseArgs = this.getCanUseArgs(context, tilePosition);
		if (!canUseArgs) {
			return false;
		}

		return Dig.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction).usable;
	}

	public canTill(context: Context, tilePosition: IVector3, tile: ITile, tool: Item | undefined, allowedTilesSet: Set<TerrainType>): boolean {
		const canUseArgs = this.getCanUseArgs(context, tilePosition);
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

		return context.utilities.base.isOpenArea(context, tilePosition, tile);
	}

	public canButcherCorpse(context: Context, tilePosition: IVector3, tool: Item | undefined) {
		const canUseArgs = this.getCanUseArgs(context, tilePosition);
		if (!canUseArgs) {
			return false;
		}

		// default to any item in the inventory just so ItemNearby is satisfied
		tool ??= context.human.inventory.containedItems[0];

		return Butcher.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool).usable;
	}

	public hasCorpses(tile: ITile) {
		return !!(tile.corpses && tile.corpses.length);
	}

	public hasItems(tile: ITile) {
		const tileContainer = tile as ITileContainer;
		return tileContainer.containedItems && tileContainer.containedItems.length > 0;
	}

	private getCanUseArgs(context: Context, position: IVector3): { point: IVector3; direction: Direction.Cardinal } | null {
		const cacheId = `${position.x},${position.y},${position.z}`;

		let result = this.canUseArgsCache.get(cacheId);
		if (result === undefined) {
			const endPositions = context.utilities.movement.getMovementEndPositions(context, position, true);
			if (endPositions.length !== 0) {
				const point = endPositions[0];
				const direction = getDirectionFromMovement(position.x - point.x, position.y - point.y);

				result = { point, direction };

			} else {
				result = null;
			}

			this.canUseArgsCache.set(cacheId, result);
		}

		return result;
	}
}
