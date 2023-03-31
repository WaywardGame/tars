define(["require", "exports", "game/entity/action/actions/Butcher", "game/entity/action/actions/Dig", "game/entity/action/actions/Till", "game/tile/ITerrain", "game/island/IIsland"], function (require, exports, Butcher_1, Dig_1, Till_1, ITerrain_1, IIsland_1) {
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
            const position = positionOverride ?? context.getTile();
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
            const tile = context.getTile();
            return context.human.isSwimming() || tile?.description?.water === true;
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
                if (options?.requireInfiniteShallowWater) {
                    if (!terrainDescription.shallowWater || terrainDescription.freshWater || terrainDescription.swampWater) {
                        return false;
                    }
                    if (context.island.checkWaterFill(tile, 50, IIsland_1.WaterType.None) < 50) {
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
        canGather(context, tile, skipDoodadCheck) {
            if (!skipDoodadCheck && !tile.description?.gather && (tile.doodad || this.hasItems(tile))) {
                return false;
            }
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.isPlayerOnTile(false, true);
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
            const cacheId = `${tile.x},${tile.y},${tile.z}`;
            let result = this.canUseArgsCache.get(cacheId);
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
                this.canUseArgsCache.set(cacheId, result);
            }
            return result;
        }
    }
    exports.TileUtilities = TileUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBc0JBLE1BQWEsYUFBYTtRQUExQjtZQUVrQixzQkFBaUIsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM1RCxvQkFBZSxHQUEyRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBeUx0SCxDQUFDO1FBdkxPLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUVNLHNCQUFzQixDQUFDLE9BQWdCLEVBQUUsUUFBNkIsRUFBRSxnQkFBMkI7WUFDekcsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXZELE1BQU0sT0FBTyxHQUFzQjtnQkFDbEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO2FBQ3pELENBQUM7WUFFRixJQUFJLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEYsSUFBSSxjQUFjLEVBQUU7b0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDOUU7YUFDRDtZQUVELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxPQUFnQixFQUFFLFFBQTZCLEVBQUUsUUFBa0I7WUFDbEcsTUFBTSxP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