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
                result = context.utilities.navigation.getNearestTileLocation(tileType, position);
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