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
            let good = false;
            if (this.hasBase(context)) {
                good = this.isNearBase(context, point, options?.nearBaseDistanceSq);
            }
            else {
                if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
                    return false;
                }
                good = true;
            }
            if (good && this.isTreasureChestLocation(context, point)) {
                good = false;
            }
            return good;
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
        isTreasureChestLocation(context, point) {
            return context.island.treasureMaps
                .some(drawnMap => drawnMap.getTreasure()
                .some(treasure => treasure.x === point.x && treasure.y === point.y && drawnMap.position.z === point.z));
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
                case IBiome_1.BiomeType.Volcanic:
                    commonTerrainType = ITerrain_1.TerrainType.BasaltGround;
                    rockTypes = new Set([ITerrain_1.TerrainType.Basalt]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBb0JBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFTMUMsTUFBYSxhQUFhO1FBSWxCLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBZ0I7WUFDN0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxrQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUN0RCxDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsS0FBZSxFQUFFLElBQVcsRUFBRSxPQUFvQztZQUMxRyxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLEtBQUssRUFBRTtnQkFFbkMsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDdkgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztZQUVqQixJ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