define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "utilities/game/TileHelpers"], function (require, exports, ITerrain_1, Terrains_1, TileHelpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TileUtilities = void 0;
    class TileUtilities {
        constructor() {
            this.cache = new Map();
        }
        clearCache() {
            this.cache.clear();
        }
        async getNearestTileLocation(context, tileType, positionOverride) {
            const position = positionOverride ?? (context.options.fasterPlanning ? context.getPosition() : context.human);
            const results = [
                await this._getNearestTileLocation(context, tileType, position)
            ];
            if (!positionOverride && context.options.allowCaves) {
                const oppositeOrigin = context.utilities.navigation.getOppositeOrigin();
                if (oppositeOrigin && oppositeOrigin.z !== position.z) {
                    results.push(await this._getNearestTileLocation(context, tileType, oppositeOrigin));
                }
            }
            return results.flat();
        }
        async _getNearestTileLocation(context, tileType, position) {
            const cacheId = `${tileType},${position.x},${position.y},${position.z}`;
            let result = this.cache.get(cacheId);
            if (!result) {
                result = await context.utilities.navigation.getNearestTileLocation(tileType, position);
                this.cache.set(cacheId, result);
            }
            return result;
        }
        isSwimmingOrOverWater(context) {
            return context.human.isSwimming() || Terrains_1.default[TileHelpers_1.default.getType(context.human.island.getTileFromPoint(context.getPosition()))]?.water === true;
        }
        isOverDeepSeaWater(context) {
            return TileHelpers_1.default.getType(context.human.island.getTileFromPoint(context.getPosition())) === ITerrain_1.TerrainType.DeepSeawater;
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
                if (options?.requireShallowWater) {
                    if (!terrainInfo.shallowWater) {
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
        canDig(context, tile) {
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !this.hasItems(tile) && !context.human.island.isPlayerAtTile(tile, false, true);
        }
        canButcherCorpse(context, tile, skipCorpseCheck) {
            return (skipCorpseCheck || this.hasCorpses(tile))
                && !tile.creature && !tile.npc && !this.hasItems(tile) && !context.human.island.isPlayerAtTile(tile, false, true) && !context.human.island.tileEvents.blocksTile(tile);
        }
        hasCorpses(tile) {
            return !!(tile.corpses && tile.corpses.length);
        }
        hasItems(tile) {
            const tileContainer = tile;
            return tileContainer.containedItems && tileContainer.containedItems.length > 0;
        }
    }
    exports.TileUtilities = TileUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZ0JBLE1BQWEsYUFBYTtRQUExQjtZQUVrQixVQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUEySGxFLENBQUM7UUF6SE8sVUFBVTtZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsT0FBZ0IsRUFBRSxRQUFxQixFQUFFLGdCQUEyQjtZQUN2RyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5RyxNQUFNLE9BQU8sR0FBc0I7Z0JBQ2xDLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDO2FBQy9ELENBQUM7WUFHRixJQUFJLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLENBQUM7Z0JBQ3hFLElBQUksY0FBYyxJQUFJLGNBQWMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsRUFBRTtvQkFDdEQsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BGO2FBQ0Q7WUFFRCxPQUFPLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixDQUFDO1FBRU8sS0FBSyxDQUFDLHVCQUF1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