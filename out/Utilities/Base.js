define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "game/WorldZ", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/biome/IBiome", "../core/ITars"], function (require, exports, ITerrain_1, Terrains_1, WorldZ_1, TileHelpers_1, Vector2_1, IBiome_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseUtilities = void 0;
    const nearBaseDistance = 14;
    const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);
    class BaseUtilities {
        clearCache() {
            this.tilesNearBaseCache = undefined;
        }
        shouldBuildWaterStills(context) {
            return context.island.biomeType !== IBiome_1.BiomeType.IceCap;
        }
        isGoodBuildTile(context, point, tile, openAreaRadius) {
            if (!this.isOpenArea(context, point, tile, openAreaRadius)) {
                return false;
            }
            if (!this.hasBase(context)) {
                const tileType = TileHelpers_1.default.getType(tile);
                if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
                    return false;
                }
                return true;
            }
            return this.isNearBase(context, point);
        }
        isGoodWellBuildTile(context, point, tile, onlyUnlimited) {
            if (!this.isGoodBuildTile(context, point, tile)) {
                return false;
            }
            const x = point.x;
            const y = point.y;
            const caveTerrain = Terrains_1.default[TileHelpers_1.default.getType(context.island.getTile(x, y, WorldZ_1.WorldZ.Cave))];
            if (caveTerrain && (caveTerrain.water || caveTerrain.shallowWater)) {
                return true;
            }
            if (onlyUnlimited) {
                return false;
            }
            if (caveTerrain && !caveTerrain.passable) {
                return true;
            }
            for (let x2 = x - 6; x2 <= x + 6; x2++) {
                for (let y2 = y - 6; y2 <= y + 6; y2++) {
                    const validPoint = context.island.ensureValidPoint({ x: x2, y: y2, z: point.z });
                    if (validPoint) {
                        const tileDescription = Terrains_1.default[TileHelpers_1.default.getType(context.island.getTileFromPoint(validPoint))];
                        if (tileDescription && (tileDescription.water && !tileDescription.freshWater)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        isOpenArea(context, point, tile, radius = 1) {
            if (!context.utilities.tile.isOpenTile(context, point, tile, false) || context.utilities.tile.hasCorpses(tile)) {
                return false;
            }
            if (radius > 0) {
                for (let x = -radius; x <= radius; x++) {
                    for (let y = -radius; y <= radius; y++) {
                        const nearbyPoint = {
                            x: point.x + x,
                            y: point.y + y,
                            z: point.z,
                        };
                        if (!context.island.ensureValidPoint(nearbyPoint)) {
                            continue;
                        }
                        const container = tile;
                        if (container.containedItems && container.containedItems.length > 0) {
                            return false;
                        }
                        const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
                        if (!context.utilities.tile.isOpenTile(context, nearbyPoint, nearbyTile)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        getBaseDoodads(context) {
            let doodads = [];
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const baseDoodadOrDoodads = context.base[key];
                if (Array.isArray(baseDoodadOrDoodads)) {
                    doodads = doodads.concat(baseDoodadOrDoodads);
                }
                else {
                    doodads.push(baseDoodadOrDoodads);
                }
            }
            return doodads;
        }
        isBaseTile(context, tile) {
            return tile.doodad ? this.isBaseDoodad(context, tile.doodad) : false;
        }
        isBaseDoodad(context, doodad) {
            return this.getBaseDoodads(context).includes(doodad);
        }
        getBasePosition(context) {
            return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.player.getPoint();
        }
        hasBase(context) {
            return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
        }
        isNearBase(context, point = context.player) {
            if (!this.hasBase(context)) {
                return false;
            }
            const baseDoodads = this.getBaseDoodads(context);
            for (const doodad of baseDoodads) {
                if (Vector2_1.default.squaredDistance(doodad, point) <= nearBaseDistanceSq) {
                    return true;
                }
            }
            return false;
        }
        getTilesNearBase(context) {
            var _a;
            const basePosition = this.getBasePosition(context);
            (_a = this.tilesNearBaseCache) !== null && _a !== void 0 ? _a : (this.tilesNearBaseCache = TileHelpers_1.default.findMatchingTiles(context.island, basePosition, () => true, {
                canVisitTile: (island, point) => this.isNearBase(context, point),
            }));
            return this.tilesNearBaseCache;
        }
        getTilesWithItemsNearBase(context) {
            const result = {
                tiles: [],
                totalCount: 0,
            };
            for (const { point, tile } of this.getTilesNearBase(context)) {
                const containedItems = tile.containedItems;
                if (!containedItems || containedItems.length === 0) {
                    continue;
                }
                result.totalCount += containedItems.length;
                result.tiles.push(point);
            }
            return result;
        }
        getTileItemsNearBase(context) {
            let result = [];
            for (const { tile } of this.getTilesNearBase(context)) {
                const containedItems = tile.containedItems;
                if (!containedItems || containedItems.length === 0) {
                    continue;
                }
                result = result.concat(containedItems);
            }
            return result;
        }
        getSwampTilesNearBase(context) {
            const result = [];
            for (const { point, tile } of this.getTilesNearBase(context)) {
                if (TileHelpers_1.default.getType(tile) === ITerrain_1.TerrainType.Swamp) {
                    result.push(point);
                }
            }
            return result;
        }
        getNonTamedCreaturesNearBase(context) {
            const result = [];
            for (const { tile } of this.getTilesNearBase(context)) {
                if (tile.creature && !tile.creature.isTamed()) {
                    result.push(tile.creature);
                }
            }
            return result;
        }
    }
    exports.BaseUtilities = BaseUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBaUJBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RCxNQUFhLGFBQWE7UUFJbEIsVUFBVTtZQUNoQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxzQkFBc0IsQ0FBQyxPQUFnQjtZQUM3QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLGtCQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3RELENBQUM7UUFFTSxlQUFlLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLGNBQXVCO1lBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxFQUFFO2dCQUMzRCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTNCLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7b0JBQzFFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXLEVBQUUs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