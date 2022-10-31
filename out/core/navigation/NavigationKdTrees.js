var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "event/EventBuses", "event/EventManager", "game/tile/ITerrain", "game/tile/Terrains", "game/WorldZ", "utilities/collection/tree/KdTree", "utilities/enum/Enums", "utilities/game/TileHelpers", "./INavigation"], function (require, exports, EventBuses_1, EventManager_1, ITerrain_1, Terrains_1, WorldZ_1, KdTree_1, Enums_1, TileHelpers_1, INavigation_1) {
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
                const terrainDescription = Terrains_1.default[tileType];
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
                    kdTreeTileTypes: new Uint8Array(game.mapSizeSq),
                };
                data.kdTrees.set(INavigation_1.freshWaterTileLocation, new KdTree_1.KdTree());
                data.kdTrees.set(INavigation_1.anyWaterTileLocation, new KdTree_1.KdTree());
                data.kdTrees.set(INavigation_1.gatherableTileLocation, new KdTree_1.KdTree());
                const halfMapSize = Math.floor(game.mapSize / 2);
                for (let offsetX = 0; offsetX < halfMapSize; offsetX++) {
                    for (let offsetY = 0; offsetY < halfMapSize; offsetY++) {
                        const x1 = halfMapSize + offsetX;
                        const y1 = halfMapSize + offsetY;
                        this.updateKdTree(island, x1, y1, z, TileHelpers_1.default.getType(island.getTile(x1, y1, z)), data);
                        if (offsetX !== 0 || offsetY !== 0) {
                            const x2 = halfMapSize - offsetX;
                            const y2 = halfMapSize - offsetY;
                            this.updateKdTree(island, x2, y2, z, TileHelpers_1.default.getType(island.getTile(x2, y2, z)), data);
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
        onTileUpdate(island, tile, tileX, tileY, tileZ, tileUpdateType) {
            const maps = this.maps.get(island);
            if (!maps) {
                return;
            }
            this.updateKdTree(island, tileX, tileY, tileZ, TileHelpers_1.default.getType(tile), maps.get(tileZ));
        }
        updateKdTree(island, x, y, z, tileType, navigationMapData = this.maps.get(island)?.get(z)) {
            if (!navigationMapData) {
                throw new Error(`Invalid navigation info for ${island}, ${z}`);
            }
            const point = { x, y };
            const kdTreeIndex = (y * game.mapSize) + x;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbktkVHJlZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25LZFRyZWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFzQkEsTUFBYSxpQkFBaUI7UUFBOUI7WUFFWSxTQUFJLEdBQXFELElBQUksR0FBRyxFQUFFLENBQUM7WUFFMUQsb0JBQWUsR0FBcUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUM5QyxrQkFBYSxHQUFxQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQzVDLG9CQUFlLEdBQXFCLElBQUksR0FBRyxFQUFFLENBQUM7UUFvS25FLENBQUM7UUFsS1UsSUFBSTtZQUNQLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBVyxDQUFDLEVBQUU7Z0JBQzlDLE1BQU0sWUFBWSxHQUFHLHNCQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7b0JBQy9DLFNBQVM7aUJBQ1o7Z0JBRUQsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFFdEM7cUJBQU0sSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUMxQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDcEM7Z0JBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FB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