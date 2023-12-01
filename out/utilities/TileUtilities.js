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
define(["require", "exports", "@wayward/game/game/entity/action/actions/Butcher", "@wayward/game/game/entity/action/actions/Dig", "@wayward/game/game/entity/action/actions/Till", "@wayward/game/game/tile/ITerrain", "@wayward/game/game/island/IIsland"], function (require, exports, Butcher_1, Dig_1, Till_1, ITerrain_1, IIsland_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TileUtilities = void 0;
    class TileUtilities {
        constructor() {
            this.tileLocationCache = new Map();
            this.canUseArgsCache = new Map();
        }
        clearCache() {
            this.tileLocationCache.clear();
            this.canUseArgsCache.clear();
        }
        getNearestTileLocation(context, tileType, tileOverride) {
            const tile = tileOverride ?? context.getTile();
            const results = [
                this._getNearestTileLocation(context, tileType, tile)
            ];
            if (!tileOverride && context.options.allowCaves) {
                const oppositeOrigin = context.utilities.navigation.calculateOppositeOrigin(tile.z);
                if (oppositeOrigin) {
                    results.push(this._getNearestTileLocation(context, tileType, oppositeOrigin));
                }
            }
            return results.flat();
        }
        _getNearestTileLocation(context, tileType, tile) {
            const cacheId = `${tileType},${tile.id}`;
            let result = this.tileLocationCache.get(cacheId);
            if (!result) {
                result = context.utilities.navigation.getNearestTileLocation(context.island, tileType, tile);
                this.tileLocationCache.set(cacheId, result);
            }
            return result;
        }
        isSwimmingOrOverWater(context) {
            const tile = context.getTile();
            return context.human.isSwimming || tile?.description?.water === true;
        }
        isOverDeepSeaWater(context) {
            return context.getTile()?.type === ITerrain_1.TerrainType.DeepSeawater;
        }
        isOpenTile(context, tile, options) {
            if (options?.requireNoItemsOnTile) {
                const container = tile;
                if (container.containedItems && container.containedItems.length > 0) {
                    return false;
                }
            }
            else if (tile.isFull) {
                return false;
            }
            if (tile.doodad) {
                return false;
            }
            const terrainType = tile.type;
            if (terrainType === ITerrain_1.TerrainType.CaveEntrance || terrainType === ITerrain_1.TerrainType.Lava || terrainType === ITerrain_1.TerrainType.CoolingLava) {
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
                    if (!terrainDescription.shallowWater || terrainDescription.freshWater || terrainDescription.swampWater) {
                        return false;
                    }
                    if (context.island.checkWaterFill(tile, 50, IIsland_1.WaterType.None).count < 50) {
                        return false;
                    }
                }
                else if (options?.disallowWater && (terrainDescription.water || terrainDescription.shallowWater)) {
                    return false;
                }
            }
            return this.isFreeOfOtherPlayers(context, tile);
        }
        isFreeOfOtherPlayers(context, tile) {
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
        canGather(context, tile, skipDoodadCheck) {
            if (!skipDoodadCheck && !tile.description?.gather && (tile.doodad || this.hasItems(tile))) {
                return false;
            }
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.isPlayerOnTile();
        }
        canDig(context, tile) {
            const canUseArgs = this.getCanUseArgs(context, tile);
            if (!canUseArgs) {
                return false;
            }
            return Dig_1.default.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction).usable;
        }
        canTill(context, tile, tool, allowedTilesSet) {
            const canUseArgs = this.getCanUseArgs(context, tile);
            if (!canUseArgs) {
                return false;
            }
            tool ??= context.human.inventory.containedItems[0];
            const canUse = Till_1.default.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool);
            if (!canUse.usable) {
                return false;
            }
            if (!allowedTilesSet.has(canUse.isGrass ? ITerrain_1.TerrainType.Dirt : canUse.tileType)) {
                return false;
            }
            return context.utilities.base.isOpenArea(context, tile);
        }
        canButcherCorpse(context, tile, tool) {
            const canUseArgs = this.getCanUseArgs(context, tile);
            if (!canUseArgs) {
                return false;
            }
            tool ??= context.human.inventory.containedItems[0];
            return Butcher_1.default.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction, tool).usable;
        }
        hasCorpses(tile) {
            return !!(tile.corpses && tile.corpses.length);
        }
        hasItems(tile) {
            const tileContainer = tile;
            return tileContainer.containedItems && tileContainer.containedItems.length > 0;
        }
        getCanUseArgs(context, tile) {
            let result = this.canUseArgsCache.get(tile.id);
            if (result === undefined) {
                const endPositions = context.utilities.movement.getMovementEndPositions(context, tile, true);
                if (endPositions.length !== 0) {
                    const point = endPositions[0];
                    const direction = context.island.getDirectionFromMovement(tile.x - point.x, tile.y - point.y);
                    result = { point, direction };
                }
                else {
                    result = null;
                }
                this.canUseArgsCache.set(tile.id, result);
            }
            return result;
        }
    }
    exports.TileUtilities = TileUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZVV0aWxpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZVV0aWxpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBd0JILE1BQWEsYUFBYTtRQUExQjtZQUVrQixzQkFBaUIsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCxvQkFBZSxHQUEyRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBMkx0SCxDQUFDO1FBekxPLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVNLHNCQUFzQixDQUFDLE9BQWdCLEVBQUUsUUFBNkIsRUFBRSxZQUFtQjtZQUNqRyxNQUFNLElBQUksR0FBRyxZQUFZLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRS9DLE1BQU0sT0FBTyxHQUFzQjtnQkFDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO2FBQ3JELENBQUM7WUFFRixJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ2pELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEYsSUFBSSxjQUFjLEVBQUUsQ0FBQztvQkFDcEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyx1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