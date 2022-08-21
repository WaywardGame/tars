define(["require", "exports", "game/tile/ITerrain", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/biome/IBiome", "../core/ITars", "game/island/IIsland"], function (require, exports, ITerrain_1, TileHelpers_1, Vector2_1, IBiome_1, ITars_1, IIsland_1) {
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
            const well = context.island.calculateWell(point);
            if (well.waterType !== IIsland_1.WaterType.FreshWater && well.waterType !== IIsland_1.WaterType.Seawater) {
                return false;
            }
            return onlyUnlimited ? well.quantity === -1 : false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBZUEsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBU3pELE1BQWEsYUFBYTtRQUlsQixVQUFVO1lBQ2hCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUM7UUFDckMsQ0FBQztRQUVNLHNCQUFzQixDQUFDLE9BQWdCO1lBQzdDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEtBQUssa0JBQVMsQ0FBQyxNQUFNLENBQUM7UUFDdEQsQ0FBQztRQUVNLGVBQWUsQ0FBQyxPQUFnQixFQUFFLEtBQWUsRUFBRSxJQUFXLEVBQUUsT0FBb0M7WUFDMUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxFQUFFO2dCQUN2SCxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBRTNCLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFNBQVMsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxNQUFNLEVBQUU7b0JBQzFFLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsa0JB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