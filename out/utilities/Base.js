define(["require", "exports", "game/tile/ITerrain", "utilities/game/TileHelpers", "utilities/math/Vector2", "game/biome/IBiome", "game/island/IIsland", "../core/ITars", "./Object", "game/doodad/DoodadManager", "game/doodad/Doodads", "../objectives/analyze/AnalyzeBase"], function (require, exports, ITerrain_1, TileHelpers_1, Vector2_1, IBiome_1, IIsland_1, ITars_1, Object_1, DoodadManager_1, Doodads_1, AnalyzeBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseUtilities = void 0;
    const nearBaseDistance = 14;
    const nearBaseDistanceSq = Math.pow(nearBaseDistance, 2);
    const nearRocksDistance = Math.pow(24, 2);
    const nearWaterDistance = Math.pow(24, 2);
    class BaseUtilities {
        clearCache() {
            this.tilesNearBaseCache = undefined;
        }
        shouldBuildWaterStills(context) {
            return context.island.biomeType !== IBiome_1.BiomeType.IceCap;
        }
        isGoodBuildTile(context, point, tile, options) {
            const tileType = TileHelpers_1.default.getType(tile);
            if (tileType === ITerrain_1.TerrainType.Swamp) {
                return false;
            }
            if (!this.isOpenArea(context, point, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
                return false;
            }
            if (!this.hasBase(context)) {
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
            if (!context.utilities.tile.isOpenTile(context, point, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireInfiniteShallowWater: requireShallowWater }) ||
                context.utilities.tile.hasCorpses(tile)) {
                return false;
            }
            if (radius > 0) {
                for (let x = -radius; x <= radius; x++) {
                    for (let y = -radius; y <= radius; y++) {
                        if (x === 0 && y === 0) {
                            continue;
                        }
                        const nearbyPoint = context.island.ensureValidPoint({
                            x: point.x + x,
                            y: point.y + y,
                            z: point.z,
                        });
                        if (!nearbyPoint) {
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
                if (doodad.z === point.z && (distanceSq === Infinity || Vector2_1.default.squaredDistance(doodad, point) <= distanceSq)) {
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
        matchesBaseInfo(context, info, doodadType, point) {
            const doodadDescription = Doodads_1.default[doodadType];
            if (!doodadDescription) {
                return false;
            }
            if (point && info.tryPlaceNear !== undefined) {
                const placeNearDoodads = context.base[info.tryPlaceNear];
                const isValid = AnalyzeBase_1.default.getNearPoints(point)
                    .some((point) => {
                    const tile = context.island.getTileFromPoint(point);
                    if (tile.doodad && (placeNearDoodads.includes(tile.doodad) || this.matchesBaseInfo(context, ITars_1.baseInfo[info.tryPlaceNear], tile.doodad.type))) {
                        return true;
                    }
                    if (context.utilities.base.isOpenArea(context, point, tile, 0)) {
                        return true;
                    }
                    return false;
                });
                if (!isValid) {
                    return false;
                }
            }
            if (info.doodadTypes) {
                for (const doodadTypeOrGroup of info.doodadTypes) {
                    if (DoodadManager_1.default.isGroup(doodadTypeOrGroup)) {
                        if (DoodadManager_1.default.isInGroup(doodadType, doodadTypeOrGroup)) {
                            return true;
                        }
                        if (doodadDescription.group && doodadDescription.group.includes(doodadTypeOrGroup)) {
                            return true;
                        }
                    }
                    else if (doodadTypeOrGroup === doodadType) {
                        return true;
                    }
                }
            }
            if (info.litType !== undefined && doodadDescription.lit !== undefined) {
                const litDescription = Doodads_1.default[doodadDescription.lit];
                if (litDescription && DoodadManager_1.default.isInGroup(doodadDescription.lit, info.litType)) {
                    return true;
                }
            }
            return false;
        }
        async findInitialBuildTile(context) {
            const facingPoint = context.human.getFacingPoint();
            const facingTile = context.human.getFacingTile();
            if (await this.isGoodTargetOrigin(context, facingPoint) && context.utilities.base.isGoodBuildTile(context, facingPoint, facingTile)) {
                return facingPoint;
            }
            const sortedObjects = context.utilities.object.getSortedObjects(context, Object_1.FindObjectType.Doodad, context.island.doodads.getObjects());
            for (const doodad of sortedObjects) {
                if (doodad !== undefined && doodad.z === context.human.z) {
                    const description = doodad.description();
                    if (description && description.isTree && await this.isGoodTargetOrigin(context, doodad)) {
                        for (let x = -6; x <= 6; x++) {
                            for (let y = -6; y <= 6; y++) {
                                if (x === 0 && y === 0) {
                                    continue;
                                }
                                const point = context.island.ensureValidPoint({
                                    x: doodad.x + x,
                                    y: doodad.y + y,
                                    z: doodad.z,
                                });
                                if (!point) {
                                    continue;
                                }
                                const tile = context.island.getTileFromPoint(point);
                                if (context.utilities.base.isGoodBuildTile(context, point, tile)) {
                                    return point;
                                }
                            }
                        }
                    }
                }
            }
        }
        async isGoodTargetOrigin(context, origin) {
            let nearbyTrees = 0;
            let nearbyCommonTiles = 0;
            let commonTerrainType;
            let rockTypes;
            let waterType;
            let treeRequirementCount = 6;
            switch (context.island.biomeType) {
                case IBiome_1.BiomeType.Coastal:
                    commonTerrainType = ITerrain_1.TerrainType.Grass;
                    rockTypes = new Set([ITerrain_1.TerrainType.Granite]);
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    break;
                case IBiome_1.BiomeType.IceCap:
                    commonTerrainType = ITerrain_1.TerrainType.Snow;
                    rockTypes = new Set([ITerrain_1.TerrainType.GraniteWithSnow]);
                    waterType = ITerrain_1.TerrainType.FreezingSeawater;
                    break;
                case IBiome_1.BiomeType.Arid:
                    commonTerrainType = ITerrain_1.TerrainType.DesertSand;
                    rockTypes = new Set([ITerrain_1.TerrainType.Sandstone]);
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    treeRequirementCount = 3;
                    break;
                case IBiome_1.BiomeType.Wetlands:
                    commonTerrainType = ITerrain_1.TerrainType.Spikerush;
                    rockTypes = new Set([ITerrain_1.TerrainType.Granite, ITerrain_1.TerrainType.GraniteGround]);
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    treeRequirementCount = 3;
                    break;
                default:
                    commonTerrainType = ITerrain_1.TerrainType.Dirt;
                    rockTypes = new Set([ITerrain_1.TerrainType.Granite]);
                    waterType = ITerrain_1.TerrainType.ShallowSeawater;
                    break;
            }
            for (let x = -6; x <= 6; x++) {
                for (let y = -6; y <= 6; y++) {
                    if (x === 0 && y === 0) {
                        continue;
                    }
                    const point = context.island.ensureValidPoint({
                        x: origin.x + x,
                        y: origin.y + y,
                        z: origin.z,
                    });
                    if (!point) {
                        continue;
                    }
                    const tile = context.island.getTileFromPoint(point);
                    if (tile.doodad) {
                        const description = tile.doodad.description();
                        if (description && description.isTree) {
                            nearbyTrees++;
                        }
                    }
                    else if (context.utilities.base.isGoodBuildTile(context, point, tile)) {
                        if (TileHelpers_1.default.getType(tile) === commonTerrainType) {
                            nearbyCommonTiles++;
                        }
                    }
                }
            }
            if (nearbyCommonTiles < 20 || nearbyTrees < treeRequirementCount) {
                return false;
            }
            let foundRock = false;
            for (const rockType of rockTypes) {
                const rockTileLocations = await context.utilities.tile.getNearestTileLocation(context, rockType, origin);
                if (rockTileLocations.some(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.point) <= nearRocksDistance)) {
                    foundRock = true;
                    break;
                }
            }
            if (!foundRock) {
                return false;
            }
            const shallowSeawaterTileLocations = await context.utilities.tile.getNearestTileLocation(context, waterType, origin);
            if (shallowSeawaterTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.point) > nearWaterDistance)) {
                return false;
            }
            return true;
        }
    }
    exports.BaseUtilities = BaseUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBb0JBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFTMUMsTUFBYSxhQUFhO1FBSWxCLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBZ0I7WUFDN0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxrQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUN0RCxDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsS0FBZSxFQUFFLElBQVcsRUFBRSxPQUFvQztZQUMxRyxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLEtBQUssRUFBRTtnQkFFbkMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDdkgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9B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