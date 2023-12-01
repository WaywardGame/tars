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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "@wayward/game/event/EventBuses", "@wayward/game/event/EventManager", "@wayward/game/game/tile/ITerrain", "@wayward/game/game/tile/Terrains", "@wayward/utilities/game/WorldZ", "@wayward/game/utilities/collection/kdtree/KdTree", "@wayward/game/utilities/enum/Enums", "./INavigation"], function (require, exports, EventBuses_1, EventManager_1, ITerrain_1, Terrains_1, WorldZ_1, KdTree_1, Enums_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NavigationKdTrees = void 0;
    class NavigationKdTrees {
        constructor() {
            this.maps = new Map();
            this.freshWaterTypes = new Set();
            this.seaWaterTypes = new Set();
            this.gatherableTypes = new Set();
        }
        load() {
            this.unload();
            for (const tileType of Enums_1.default.values(ITerrain_1.TerrainType)) {
                const tileTypeName = ITerrain_1.TerrainType[tileType];
                const terrainDescription = Terrains_1.terrainDescriptions[tileType];
                if (!terrainDescription || terrainDescription.ice) {
                    continue;
                }
                if (tileTypeName.includes("FreshWater")) {
                    this.freshWaterTypes.add(tileType);
                }
                else if (tileTypeName.includes("Seawater")) {
                    this.seaWaterTypes.add(tileType);
                }
                if (terrainDescription.gather) {
                    this.gatherableTypes.add(tileType);
                }
            }
            EventManager_1.eventManager.registerEventBusSubscriber(this);
        }
        unload() {
            EventManager_1.eventManager.deregisterEventBusSubscriber(this);
            this.maps = new WeakMap();
            this.freshWaterTypes.clear();
            this.seaWaterTypes.clear();
            this.gatherableTypes.clear();
        }
        initializeIsland(island) {
            let islandMaps = this.maps.get(island);
            if (islandMaps) {
                return;
            }
            islandMaps = new Map();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                const data = {
                    kdTrees: new Map(),
                    kdTreeTileTypes: new Uint8Array(island.mapSizeSq),
                };
                data.kdTrees.set(INavigation_1.freshWaterTileLocation, new KdTree_1.KdTree());
                data.kdTrees.set(INavigation_1.anyWaterTileLocation, new KdTree_1.KdTree());
                data.kdTrees.set(INavigation_1.gatherableTileLocation, new KdTree_1.KdTree());
                const halfMapSize = Math.floor(island.mapSize / 2);
                for (let offsetX = 0; offsetX < halfMapSize; offsetX++) {
                    for (let offsetY = 0; offsetY < halfMapSize; offsetY++) {
                        const x1 = halfMapSize + offsetX;
                        const y1 = halfMapSize + offsetY;
                        this.updateKdTree(island, x1, y1, z, island.getTile(x1, y1, z).type, data);
                        if (offsetX !== 0 || offsetY !== 0) {
                            const x2 = halfMapSize - offsetX;
                            const y2 = halfMapSize - offsetY;
                            this.updateKdTree(island, x2, y2, z, island.getTile(x2, y2, z).type, data);
                        }
                    }
                }
                islandMaps.set(z, data);
            }
            this.maps.set(island, islandMaps);
        }
        getKdTree(island, z, tileType) {
            return this.maps.get(island)?.get(z)?.kdTrees.get(tileType);
        }
        onTileUpdate(island, tile, tileUpdateType) {
            const maps = this.maps.get(island);
            if (!maps) {
                return;
            }
            this.updateKdTree(island, tile.x, tile.y, tile.z, tile.type, maps.get(tile.z));
        }
        updateKdTree(island, x, y, z, tileType, navigationMapData = this.maps.get(island)?.get(z)) {
            if (!navigationMapData) {
                throw new Error(`Invalid navigation info for ${island}, ${z}`);
            }
            const point = { x, y };
            const kdTreeIndex = (y * island.mapSize) + x;
            let kdTreeTileType = navigationMapData.kdTreeTileTypes[kdTreeIndex];
            if (kdTreeTileType !== 0) {
                kdTreeTileType--;
                if (kdTreeTileType === tileType) {
                    return;
                }
                navigationMapData.kdTrees.get(kdTreeTileType).remove(point);
                this.updateKdTreeSpecialTileTypes(navigationMapData, kdTreeTileType, point, false);
            }
            navigationMapData.kdTreeTileTypes[kdTreeIndex] = tileType + 1;
            let kdTree = navigationMapData.kdTrees.get(tileType);
            if (!kdTree) {
                kdTree = new KdTree_1.KdTree();
                navigationMapData.kdTrees.set(tileType, kdTree);
            }
            kdTree.add(point);
            this.updateKdTreeSpecialTileTypes(navigationMapData, tileType, point, true);
        }
        updateKdTreeSpecialTileTypes(navigationMapData, tileType, point, insert) {
            const isFreshWater = this.freshWaterTypes.has(tileType);
            const isSeawater = this.seaWaterTypes.has(tileType);
            if (isFreshWater || isSeawater) {
                if (insert) {
                    navigationMapData.kdTrees.get(INavigation_1.anyWaterTileLocation).add(point);
                }
                else {
                    navigationMapData.kdTrees.get(INavigation_1.anyWaterTileLocation).remove(point);
                }
                if (isFreshWater) {
                    if (insert) {
                        navigationMapData.kdTrees.get(INavigation_1.freshWaterTileLocation).add(point);
                    }
                    else {
                        navigationMapData.kdTrees.get(INavigation_1.freshWaterTileLocation).remove(point);
                    }
                }
            }
            if (this.gatherableTypes.has(tileType)) {
                if (insert) {
                    navigationMapData.kdTrees.get(INavigation_1.gatherableTileLocation).add(point);
                }
                else {
                    navigationMapData.kdTrees.get(INavigation_1.gatherableTileLocation).remove(point);
                }
            }
        }
    }
    exports.NavigationKdTrees = NavigationKdTrees;
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Island, "tileUpdate")
    ], NavigationKdTrees.prototype, "onTileUpdate", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbktkVHJlZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25LZFRyZWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7Ozs7Ozs7SUF3QkgsTUFBYSxpQkFBaUI7UUFBOUI7WUFFUyxTQUFJLEdBQXFELElBQUksR0FBRyxFQUFFLENBQUM7WUFFMUQsb0JBQWUsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM5QyxrQkFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzVDLG9CQUFlLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFvS2hFLENBQUM7UUFsS08sSUFBSTtZQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBVyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxZQUFZLEdBQUcsc0JBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFM0MsTUFBTSxrQkFBa0IsR0FBRyw4QkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDekQsSUFBSSxDQUFDLGtCQUFrQixJQUFJLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNuRCxTQUFTO2dCQUNWLENBQUM7Z0JBRUQsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUVwQyxDQUFDO3FCQUFNLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUM5QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFFRCxJQUFJLGtCQUFrQixDQUFDLE1B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