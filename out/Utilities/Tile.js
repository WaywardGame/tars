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
            const position = positionOverride ?? context.human;
            const results = [];
            const z = position.z;
            const cacheId = `${tileType},${position.x},${position.y},${z}`;
            let result = this.cache.get(cacheId);
            if (!result) {
                result = await context.utilities.navigation.getNearestTileLocation(tileType, { x: position.x, y: position.y, z: z });
                this.cache.set(cacheId, result);
            }
            results.push(result);
            return results.flat();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZ0JBLE1BQWEsYUFBYTtRQUExQjtZQUVrQixVQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUFtSGxFLENBQUM7UUFqSE8sVUFBVTtZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsT0FBZ0IsRUFBRSxRQUFxQixFQUFFLGdCQUEyQjtZQUN2RyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDO1lBRW5ELE1BQU0sT0FBTyxHQUFzQixFQUFFLENBQUM7WUFHdEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVyQixNQUFNLE9BQU8sR0FBRyxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFFL0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDckgsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ2hDO1lBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUdyQixPQUFP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