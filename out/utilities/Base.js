define(["require", "exports", "game/tile/ITerrain", "utilities/math/Vector2", "game/biome/IBiome", "game/island/IIsland", "../core/ITars", "./Object", "game/doodad/DoodadManager", "game/doodad/Doodads", "../objectives/analyze/AnalyzeBase"], function (require, exports, ITerrain_1, Vector2_1, IBiome_1, IIsland_1, ITars_1, Object_1, DoodadManager_1, Doodads_1, AnalyzeBase_1) {
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
        isGoodBuildTile(context, tile, options) {
            const tileType = tile.type;
            if (tileType === ITerrain_1.TerrainType.Swamp) {
                return false;
            }
            if (!this.isOpenArea(context, tile, options?.openAreaRadius, options?.allowWater, options?.requireShallowWater)) {
                return false;
            }
            let good = false;
            if (this.hasBase(context)) {
                good = this.isNearBase(context, tile, options?.nearBaseDistanceSq);
            }
            else {
                if (tileType === ITerrain_1.TerrainType.BeachSand || tileType === ITerrain_1.TerrainType.Gravel) {
                    return false;
                }
                good = true;
            }
            if (good && this.isTreasureChestLocation(context, tile)) {
                good = false;
            }
            return good;
        }
        isGoodWellBuildTile(context, tile, onlyUnlimited) {
            if (!this.isGoodBuildTile(context, tile)) {
                return false;
            }
            const well = context.island.calculateWell(tile);
            if (well.waterType !== IIsland_1.WaterType.FreshWater && well.waterType !== IIsland_1.WaterType.Seawater) {
                return false;
            }
            return onlyUnlimited ? well.quantity === -1 : false;
        }
        isOpenArea(context, tile, radius = 1, allowWater = false, requireShallowWater = false) {
            if (!context.utilities.tile.isOpenTile(context, tile, { disallowWater: !allowWater, requireNoItemsOnTile: true, requireInfiniteShallowWater: requireShallowWater }) ||
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
                            x: tile.x + x,
                            y: tile.y + y,
                            z: tile.z,
                        });
                        if (!nearbyPoint) {
                            continue;
                        }
                        const nearbyTile = context.island.getTileFromPoint(nearbyPoint);
                        if (!context.utilities.tile.isOpenTile(context, nearbyTile, { disallowWater: !requireShallowWater, requireNoItemsOnTile: false })) {
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
        getBaseTile(context) {
            return (context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0])?.tile ?? context.human.tile;
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
            const baseTile = this.getBaseTile(context);
            this.tilesNearBaseCache ??= baseTile.findMatchingTiles(() => true, {
                canVisitTile: (tile) => this.isNearBase(context, tile),
            });
            return this.tilesNearBaseCache;
        }
        getTilesWithItemsNearBase(context) {
            const result = {
                tiles: [],
                totalCount: 0,
            };
            for (const tile of this.getTilesNearBase(context)) {
                const containedItems = tile.containedItems;
                if (!containedItems || containedItems.length === 0) {
                    continue;
                }
                result.totalCount += containedItems.length;
                result.tiles.push(tile);
            }
            return result;
        }
        getTileItemsNearBase(context) {
            let result = [];
            for (const tile of this.getTilesNearBase(context)) {
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
            for (const tile of this.getTilesNearBase(context)) {
                if (tile.type === ITerrain_1.TerrainType.Swamp) {
                    result.push(tile);
                }
            }
            return result;
        }
        getNonTamedCreaturesNearBase(context) {
            const result = [];
            for (const tile of this.getTilesNearBase(context)) {
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
            const doodadDescription = Doodads_1.doodadDescriptions[doodadType];
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
                    if (context.utilities.base.isOpenArea(context, tile, 0)) {
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
                const litDescription = Doodads_1.doodadDescriptions[doodadDescription.lit];
                if (litDescription && DoodadManager_1.default.isInGroup(doodadDescription.lit, info.litType)) {
                    return true;
                }
            }
            return false;
        }
        async findInitialBuildTile(context) {
            const facingTile = context.human.facingTile;
            if (await this.isGoodTargetOrigin(context, facingTile) && context.utilities.base.isGoodBuildTile(context, facingTile)) {
                return facingTile;
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
                                if (context.utilities.base.isGoodBuildTile(context, tile)) {
                                    return tile;
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
                    else if (context.utilities.base.isGoodBuildTile(context, tile)) {
                        if (tile.type === commonTerrainType) {
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
                const rockTileLocations = context.utilities.tile.getNearestTileLocation(context, rockType, origin);
                if (rockTileLocations.some(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.tile) <= nearRocksDistance)) {
                    foundRock = true;
                    break;
                }
            }
            if (!foundRock) {
                return false;
            }
            const shallowSeawaterTileLocations = context.utilities.tile.getNearestTileLocation(context, waterType, origin);
            if (shallowSeawaterTileLocations.every(tileLocation => Vector2_1.default.squaredDistance(origin, tileLocation.tile) > nearWaterDistance)) {
                return false;
            }
            return true;
        }
    }
    exports.BaseUtilities = BaseUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBbUJBLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFTMUMsTUFBYSxhQUFhO1FBSWxCLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBZ0I7WUFDN0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxrQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUN0RCxDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsSUFBVSxFQUFFLE9BQW9DO1lBQ3hGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDM0IsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBRW5DLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDaEgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztZQUVqQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVB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