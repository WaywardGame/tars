/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/tile/ITerrain", "utilities/math/Vector2", "game/biome/IBiome", "game/island/IIsland", "../core/ITars", "./Object", "game/doodad/DoodadManager", "game/doodad/Doodads", "../objectives/analyze/AnalyzeBase", "../core/context/IContext"], function (require, exports, ITerrain_1, Vector2_1, IBiome_1, IIsland_1, ITars_1, Object_1, DoodadManager_1, Doodads_1, AnalyzeBase_1, IContext_1) {
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
                        const nearbyTile = context.island.getTileSafe(tile.x + x, tile.y + y, tile.z);
                        if (!nearbyTile) {
                            continue;
                        }
                        if (!context.utilities.tile.isOpenTile(context, nearbyTile, { disallowWater: !requireShallowWater, requireNoItemsOnTile: false })) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
        getBaseTiles(context) {
            const tiles = new Set();
            const keys = Object.keys(ITars_1.baseInfo);
            for (const key of keys) {
                const baseDoodadOrDoodads = context.base[key];
                if (Array.isArray(baseDoodadOrDoodads)) {
                    for (const doodad of baseDoodadOrDoodads) {
                        tiles.add(doodad.tile);
                    }
                }
            }
            return tiles;
        }
        isBaseDoodad(context, doodad) {
            return this.getBaseTiles(context).has(doodad.tile);
        }
        getBaseTile(context) {
            return (context.base.campfire[0] || context.base.waterStill[0] || context.base.kiln[0])?.tile ?? context.human.tile;
        }
        hasBase(context) {
            return context.base.campfire.length > 0 || context.base.waterStill.length > 0;
        }
        isNearBase(context, point = context.human, distanceSq = nearBaseDistanceSq) {
            if (IContext_1.nearBaseDataKeys.some(nearBaseDataKey => context.hasData(nearBaseDataKey))) {
                return true;
            }
            if (!this.hasBase(context)) {
                return false;
            }
            const baseTiles = this.getBaseTiles(context);
            for (const baseTile of baseTiles) {
                if (baseTile.z === point.z && (distanceSq === Infinity || Vector2_1.default.squaredDistance(baseTile, point) <= distanceSq)) {
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
            return this.getTilesNearBase(context).filter(tile => tile.type === ITerrain_1.TerrainType.Swamp);
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
                    const description = doodad.description;
                    if (description && description.isTree && await this.isGoodTargetOrigin(context, doodad)) {
                        for (let x = -6; x <= 6; x++) {
                            for (let y = -6; y <= 6; y++) {
                                if (x === 0 && y === 0) {
                                    continue;
                                }
                                const tile = context.island.getTileSafe(doodad.x + x, doodad.y + y, doodad.z);
                                if (!tile) {
                                    continue;
                                }
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
                    const tile = context.island.getTileSafe(origin.x + x, origin.y + y, origin.z);
                    if (!tile) {
                        continue;
                    }
                    if (tile.doodad) {
                        const description = tile.doodad.description;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvQmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBc0JILE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRTFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFTMUMsTUFBYSxhQUFhO1FBSWxCLFVBQVU7WUFDaEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLFNBQVMsQ0FBQztRQUNyQyxDQUFDO1FBRU0sc0JBQXNCLENBQUMsT0FBZ0I7WUFDN0MsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsS0FBSyxrQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUN0RCxDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsSUFBVSxFQUFFLE9BQW9DO1lBQ3hGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDM0IsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBRW5DLE9BQU8sS0FBSyxDQUFDO2FBQ2I7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDaEgsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztZQUVqQixJQUFJLElBQUksQ0FBQyxPQUFP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