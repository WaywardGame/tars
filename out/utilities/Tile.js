define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "utilities/game/TileHelpers", "game/entity/action/actions/Dig", "game/entity/action/actions/Butcher", "game/entity/action/actions/Till", "game/entity/player/IPlayer", "game/island/IIsland"], function (require, exports, ITerrain_1, Terrains_1, TileHelpers_1, Dig_1, Butcher_1, Till_1, IPlayer_1, IIsland_1) {
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
        getNearestTileLocation(context, tileType, positionOverride) {
            const position = positionOverride ?? context.getPosition();
            const results = [
                this._getNearestTileLocation(context, tileType, position)
            ];
            if (!positionOverride && context.options.allowCaves) {
                const oppositeOrigin = context.utilities.navigation.calculateOppositeOrigin(position.z);
                if (oppositeOrigin) {
                    results.push(this._getNearestTileLocation(context, tileType, oppositeOrigin));
                }
            }
            return results.flat();
        }
        _getNearestTileLocation(context, tileType, position) {
            const cacheId = `${tileType},${position.x},${position.y},${position.z}`;
            let result = this.tileLocationCache.get(cacheId);
            if (!result) {
                result = context.utilities.navigation.getNearestTileLocation(context.island, tileType, position);
                this.tileLocationCache.set(cacheId, result);
            }
            return result;
        }
        isSwimmingOrOverWater(context) {
            const tile = context.human.island.getTileFromPoint(context.getPosition());
            return context.human.isSwimming() || (tile && Terrains_1.default[TileHelpers_1.default.getType(tile)]?.water === true);
        }
        isOverDeepSeaWater(context) {
            const tile = context.human.island.getTileFromPoint(context.getPosition());
            return tile && TileHelpers_1.default.getType(tile) === ITerrain_1.TerrainType.DeepSeawater;
        }
        isOpenTile(context, point, tile, options) {
            if (options?.requireNoItemsOnTile) {
                const container = tile;
                if (container.containedItems && container.containedItems.length > 0) {
                    return false;
                }
            }
            else if (context.human.island.isTileFull(tile)) {
                return false;
            }
            if (tile.doodad) {
                return false;
            }
            const terrainType = TileHelpers_1.default.getType(tile);
            if (terrainType === ITerrain_1.TerrainType.CaveEntrance || terrainType === ITerrain_1.TerrainType.Lava || terrainType === ITerrain_1.TerrainType.CoolingLava) {
                return false;
            }
            const terrainInfo = Terrains_1.default[terrainType];
            if (terrainInfo) {
                if (!terrainInfo.passable && !terrainInfo.water) {
                    return false;
                }
                if (options?.requireInfiniteShallowWater) {
                    if (!terrainInfo.shallowWater || terrainInfo.freshWater || terrainInfo.swampWater) {
                        return false;
                    }
                    if (context.island.checkWaterFill(point.x, point.y, point.z, 50, IIsland_1.WaterType.None) < 50) {
                        return false;
                    }
                }
                else if (options?.disallowWater && (terrainInfo.water || terrainInfo.shallowWater)) {
                    return false;
                }
            }
            return this.isFreeOfOtherPlayers(context, point);
        }
        isFreeOfOtherPlayers(context, point) {
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
        canGather(context, tile, skipDoodadCheck) {
            if (!skipDoodadCheck && !Terrains_1.default[TileHelpers_1.default.getType(tile)]?.gather && (tile.doodad || this.hasItems(tile))) {
                return false;
            }
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !context.human.island.isPlayerAtTile(tile, false, true);
        }
        canDig(context, tilePosition) {
            const canUseArgs = this.getCanUseArgs(context, tilePosition);
            if (!canUseArgs) {
                return false;
            }
            return Dig_1.default.canUseWhileFacing(context.human, canUseArgs.point, canUseArgs.direction).usable;
        }
        canTill(context, tilePosition, tile, tool, allowedTilesSet) {
            const canUseArgs = this.getCanUseArgs(context, tilePosition);
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
            return context.utilities.base.isOpenArea(context, tilePosition, tile);
        }
        canButcherCorpse(context, tilePosition, tool) {
            const canUseArgs = this.getCanUseArgs(context, tilePosition);
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
        getCanUseArgs(context, position) {
            const cacheId = `${position.x},${position.y},${position.z}`;
            let result = this.canUseArgsCache.get(cacheId);
            if (result === undefined) {
                const endPositions = context.utilities.movement.getMovementEndPositions(context, position, true);
                if (endPositions.length !== 0) {
                    const point = endPositions[0];
                    const direction = (0, IPlayer_1.getDirectionFromMovement)(position.x - point.x, position.y - point.y);
                    result = { point, direction };
                }
                else {
                    result = null;
                }
                this.canUseArgsCache.set(cacheId, result);
            }
            return result;
        }
    }
    exports.TileUtilities = TileUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBdUJBLE1BQWEsYUFBYTtRQUExQjtZQUVrQixzQkFBaUIsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCxvQkFBZSxHQUEyRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBMEx0SCxDQUFDO1FBeExPLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVNLHNCQUFzQixDQUFDLE9BQWdCLEVBQUUsUUFBcUIsRUFBRSxnQkFBMkI7WUFDakcsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRTNELE1BQU0sT0FBTyxHQUFzQjtnQkFDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO2FBQ3pELENBQUM7WUFFRixJQUFJLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEYsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDOUU7YUFDRDtZQUVELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxPQUFnQixFQUFFLFFBQXFCLEVBQUUsUUFBa0I7WUFDMUYsTUFBTSxP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