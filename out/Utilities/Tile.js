define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "game/tile/Terrains", "utilities/game/TileHelpers"], function (require, exports, ITerrain_1, Terrains_1, Terrains_2, TileHelpers_1) {
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
            const position = positionOverride ?? context.getPosition();
            const results = [
                await this._getNearestTileLocation(context, tileType, position)
            ];
            if (!positionOverride && context.options.allowCaves) {
                const oppositeOrigin = context.utilities.navigation.calculateOppositeOrigin(position.z);
                if (oppositeOrigin) {
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
            return context.human.isSwimming() || Terrains_2.default[TileHelpers_1.default.getType(context.human.island.getTileFromPoint(context.getPosition()))]?.water === true;
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
            const terrainInfo = Terrains_2.default[terrainType];
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
            if (!skipDoodadCheck && !Terrains_2.default[TileHelpers_1.default.getType(tile)]?.gather && (tile.doodad || this.hasItems(tile))) {
                return false;
            }
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !context.human.island.isPlayerAtTile(tile, false, true);
        }
        canDig(context, tile) {
            return !this.hasCorpses(tile) && !tile.creature && !tile.npc && !tile.doodad && !this.hasItems(tile) && !context.human.island.isPlayerAtTile(tile, false, true);
        }
        canTill(context, point, tile, allowedTilesSet) {
            if (tile.creature || tile.npc) {
                return false;
            }
            const tileType = TileHelpers_1.default.getType(tile);
            if (tileType === ITerrain_1.TerrainType.Grass) {
                if (!this.canDig(context, tile)) {
                    return false;
                }
                if (!allowedTilesSet.has(ITerrain_1.TerrainType.Dirt)) {
                    return false;
                }
            }
            else {
                if (!allowedTilesSet.has(tileType)) {
                    return false;
                }
                const terrainDescription = Terrains_1.default[tileType];
                if (!terrainDescription?.tillable) {
                    return false;
                }
            }
            return context.utilities.base.isOpenArea(context, point, tile);
        }
        canButcherCorpse(context, tile, skipCorpseCheck) {
            return (skipCorpseCheck || this.hasCorpses(tile))
                && !tile.creature && !tile.npc && !context.human.island.isPlayerAtTile(tile, false, true) && !context.human.island.tileEvents.blocksTile(tile);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvVGlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBaUJBLE1BQWEsYUFBYTtRQUExQjtZQUVrQixVQUFLLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7UUF5SmxFLENBQUM7UUF2Sk8sVUFBVTtZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLENBQUM7UUFFTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsT0FBZ0IsRUFBRSxRQUFxQixFQUFFLGdCQUEyQjtZQUN2RyxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFM0QsTUFBTSxPQUFPLEdBQXNCO2dCQUNsQyxNQUFNLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQzthQUMvRCxDQUFDO1lBRUYsSUFBSSxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO2dCQUNwRCxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXhGLElBQUksY0FBYyxFQUFFO29CQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztpQkFDcEY7YUFDRDtZQUVELE9BQU8sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxLQUFLLENBQUMsdUJBQXVCLENBQUMsT0FBZ0IsRUFBRSxRQUFxQixFQUFFLFFBQWtCO1lBQ2hHLE1BQU0sT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFD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