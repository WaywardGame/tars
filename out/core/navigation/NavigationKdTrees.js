var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/tile/ITerrain", "game/tile/Terrains", "game/WorldZ", "utilities/collection/tree/KdTree", "utilities/enum/Enums", "./INavigation"], function (require, exports, EventBuses_1, EventManager_1, ITerrain_1, Terrains_1, WorldZ_1, KdTree_1, Enums_1, INavigation_1) {
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
            EventManager_1.default.registerEventBusSubscriber(this);
        }
        unload() {
            EventManager_1.default.deregisterEventBusSubscriber(this);
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
    __decorate([
        (0, EventManager_1.EventHandler)(EventBuses_1.EventBus.Island, "tileUpdate")
    ], NavigationKdTrees.prototype, "onTileUpdate", null);
    exports.NavigationKdTrees = NavigationKdTrees;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbktkVHJlZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25LZFRyZWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFzQkEsTUFBYSxpQkFBaUI7UUFBOUI7WUFFWSxTQUFJLEdBQXFELElBQUksR0FBRyxFQUFFLENBQUM7WUFFMUQsb0JBQWUsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM5QyxrQkFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzVDLG9CQUFlLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFvS25FLENBQUM7UUFsS1UsSUFBSTtZQUNQLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBVyxDQUFDLEVBQUU7Z0JBQzlDLE1BQU0sWUFBWSxHQUFHLHNCQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNDLE1BQU0sa0JBQWtCLEdBQUcsOEJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7b0JBQy9DLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFFdEM7cUJBQU0sSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUMxQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDcEM7Z0JBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FB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