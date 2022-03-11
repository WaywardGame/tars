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
        isGoodBuildTile(context, point, tile, options) {
            if (!this.isOpenArea(context, point, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
                return false;
            }
            if (!this.hasBase(context)) {
                const tileType = TileHelpers_1.default.getType(tile);
                if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
                    return false;
                }
                return true;
            }
            return this.isNearBase(context, point, options?.nearBaseDistanceSq);
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
        isOpenArea(context, point, tile, radius = 1, allowWater = false, requireShallowWater = false) {
            if (!context.utilities.tile.isOpenTile(context, point, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireShallowWater }) ||
                context.utilities.tile.hasCorpses(tile)) {
                return false;
            }
            if (radius > 0) {
                for (let x = -radius; x <= radius; x++) {
                    for (let y = -radius; y <= radius; y++) {
                        if (x === 0 && y === 0) {
                            continue;
                        }
                        const nearbyPoint = {
                            x: point.x + x,
                            y: point.y + y,
                            z: point.z,
                        };
                        if (!context.island.ensureValidPoint(nearbyPoint)) {
                            continue;
                        }
                        const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
                        if (!context.utilities.tile.isOpenTile(context, nearbyPoint, nearbyTile, { disallowWater: !requireShallowWater, requireNoItemsOnTile: false })) {
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
            return context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0] || context.human.getPoint();
        }
        hasBase(context) {
            return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
        }
        isNearBase(context, point = context.human, distanceSq = nearBaseDistanceSq) {
            if (!this.hasBase(context)) {
                return false;
            }
            const baseDoodads = this.getBaseDoodads(context);
            for (const doodad of baseDoodads) {
                if (doodad.z === point.z && Vector2_1.default.squaredDistance(doodad, point) <= distanceSq) {
                    return true;
                }
            }
            return false;
        }
        getTilesNearBase(context) {
            const basePosition = this.getBasePosition(context);
            this.tilesNearBaseCache ??= TileHelpers_1.default.findMatchingTiles(context.island, basePosition, () => true, {
                canVisitTile: (island, point) => this.isNearBase(context, point),
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZ0JBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQVN6RCxNQUFhLGFBQWE7UUFJbEIsVUFBVTtZQUNoQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO1FBQ3JDLENBQUM7UUFFTSxzQkFBc0IsQ0FBQyxPQUFnQjtZQUM3QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLGtCQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3RELENBQUM7UUFFTSxlQUFlLENBQUMsT0FBZ0IsRUFBRSxLQUFlLEVBQUUsSUFBVyxFQUFFLE9BQW9DO1lBQzFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDdkgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUUzQixNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxTQUFTLElBQUksUUFBUSxLQUFLLHNCQUFXLENBQUMsTUFBTSxFQUFFO29CQUMxRSxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLGtC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