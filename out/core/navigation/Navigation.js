define(["require", "exports", "game/tile/ITerrain", "game/tile/ITileEvent", "game/WorldZ", "game/IGame"], function (require, exports, ITerrain_1, ITileEvent_1, WorldZ_1, IGame_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creaturePenaltyRadius = exports.tileUpdateRadius = void 0;
    exports.tileUpdateRadius = 2;
    exports.creaturePenaltyRadius = 2;
    class Navigation {
        constructor(log, human, overlay, kdTrees) {
            this.log = log;
            this.human = human;
            this.overlay = overlay;
            this.kdTrees = kdTrees;
            this.maps = new Map();
            this.nodePenaltyCache = new Map();
            this.nodeDisableCache = new Map();
        }
        load() {
            this.unload();
            this.origin = undefined;
            this.sailingMode = false;
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                try {
                    const data = {
                        dijkstraMap: new Module.DijkstraMap(this.human.island.mapSize),
                        dirtyDijkstra: true,
                    };
                    this.maps.set(z, data);
                }
                catch (ex) {
                    this.log.error("Failed to create dijkstraMap", ex);
                    this.maps.delete(z);
                }
            }
        }
        unload() {
            for (const mapInfo of this.maps.values()) {
                try {
                    mapInfo.dijkstraMap.delete();
                }
                catch (ex) {
                    this.log.error(`Failed to delete dijkstra map: ${ex}`);
                }
            }
            this.maps.clear();
            this.overlay.clear();
            this.nodePenaltyCache.clear();
            this.nodeDisableCache.clear();
            if (this.originUpdateTimeout !== undefined) {
                window.clearTimeout(this.originUpdateTimeout);
                this.originUpdateTimeout = undefined;
            }
        }
        shouldUpdateSailingMode(sailingMode) {
            return this.sailingMode !== sailingMode;
        }
        async updateAll(sailingMode) {
            this.log.info("Updating navigation. Please wait...");
            this.sailingMode = sailingMode;
            const island = this.human.island;
            this.kdTrees.initializeIsland(island);
            const start = performance.now();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                const mapData = this.maps.get(z);
                for (let x = 0; x < island.mapSize; x++) {
                    for (let y = 0; y < island.mapSize; y++) {
                        const tile = island.getTile(x, y, z);
                        this.onTileUpdate(island, tile, tile.type, false, undefined, mapData);
                    }
                }
            }
            const time = performance.now() - start;
            this.log.info(`Updated navigation in ${time}ms`);
        }
        getOrigin() {
            return this.origin;
        }
        queueUpdateOrigin(origin) {
            if (origin) {
                this.origin = { x: origin.x, y: origin.y, z: origin.z };
            }
            if (this.originUpdateTimeout === undefined) {
                this.originUpdateTimeout = window.setTimeout(() => {
                    this.originUpdateTimeout = undefined;
                    this.updateOrigin();
                }, 10);
            }
        }
        updateOrigin(origin) {
            if (origin) {
                this.origin = { x: origin.x, y: origin.y, z: origin.z };
            }
            if (!this.origin) {
                throw new Error("Invalid origin");
            }
            this._updateOrigin(this.origin.x, this.origin.y, this.origin.z);
            const oppositeZ = this.oppositeZ;
            if (oppositeZ === undefined) {
                return;
            }
            const nearestCaveEntrances = this.getNearestTileLocation(this.human.island, ITerrain_1.TerrainType.CaveEntrance, this.origin);
            const nearestCaveEntrance = nearestCaveEntrances[0];
            if (nearestCaveEntrance) {
                const { x, y } = nearestCaveEntrance.tile;
                if (this.oppositeOrigin && this.oppositeOrigin.x === x && this.oppositeOrigin.y === y && this.oppositeOrigin.z === oppositeZ) {
                    return;
                }
                this.oppositeOrigin = { x, y, z: oppositeZ };
                this._updateOrigin(x, y, oppositeZ);
            }
            else {
                this.oppositeOrigin = undefined;
            }
        }
        get oppositeZ() {
            if (!this.origin) {
                throw new Error("Invalid origin");
            }
            return this.calculateOppositeZ(this.origin.z);
        }
        getOppositeOrigin() {
            return this.oppositeOrigin;
        }
        calculateOppositeOrigin(z) {
            const oppositeZ = this.calculateOppositeZ(z);
            if (oppositeZ !== undefined) {
                if (this.origin?.z === oppositeZ) {
                    return this.origin;
                }
                if (this.oppositeOrigin?.z === oppositeZ) {
                    return this.oppositeOrigin;
                }
            }
            return undefined;
        }
        calculateOppositeZ(z) {
            switch (z) {
                case WorldZ_1.WorldZ.Overworld:
                    return WorldZ_1.WorldZ.Cave;
                case WorldZ_1.WorldZ.Cave:
                    return WorldZ_1.WorldZ.Overworld;
            }
            return undefined;
        }
        refreshOverlay(tile, isBaseTile, isDisabled, penalty, tileType, terrainDescription, tileUpdateType) {
            tileType ??= tile.type;
            terrainDescription ??= tile.description();
            if (!terrainDescription) {
                return;
            }
            this.overlay.addOrUpdate(tile, isBaseTile, isDisabled ?? this.isDisabled(tile, tileType), penalty ?? this.getPenalty(tile, tileType, terrainDescription, tileUpdateType));
        }
        onTileUpdate(island, tile, tileType, isBaseTile, tileUpdateType, mapData) {
            const mapInfo = this.maps.get(tile.z);
            if (!mapInfo) {
                return;
            }
            const terrainDescription = tile.description();
            if (!terrainDescription) {
                return;
            }
            const cacheId = `${tile.x},${tile.y},${tile.z}`;
            const isDisabled = this.isDisabled(tile, tileType, true);
            const penalty = this.getPenalty(tile, tileType, terrainDescription, tileUpdateType, true);
            this.nodeDisableCache.set(cacheId, isDisabled);
            this.nodePenaltyCache.set(cacheId, penalty);
            this.refreshOverlay(tile, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);
            try {
                mapInfo.dirtyDijkstra = true;
                mapInfo.dijkstraMap.updateNode(tile.x, tile.y, penalty, isDisabled);
            }
            catch (ex) {
                this.log.trace("invalid node", tile.x, tile.y, penalty, isDisabled);
            }
            if (!mapData) {
                this.queueUpdateOrigin();
            }
        }
        getNearestTileLocation(island, tileType, point) {
            const kdTree = this.kdTrees.getKdTree(island, point.z, tileType);
            if (!kdTree) {
                return [];
            }
            const nearestPoints = kdTree.nearestPoints(point, 5);
            return nearestPoints.map(np => {
                const nearestPoint = {
                    ...np.point,
                    z: point.z,
                };
                const tile = island.getTileFromPoint(nearestPoint);
                if (!tile) {
                    throw new Error(`Invalid point ${nearestPoint.x},${nearestPoint.y}`);
                }
                return {
                    type: tileType,
                    tile,
                };
            });
        }
        isDisabledFromPoint(island, point) {
            if (!island.ensureValidPoint(point)) {
                return true;
            }
            const tile = island.getTileFromPoint(point);
            const tileType = tile.type;
            return this.isDisabled(tile, tileType);
        }
        getPenaltyFromPoint(island, point, tile = island.getTileFromPoint(point)) {
            const tileType = tile.type;
            const terrainDescription = tile.description();
            if (!terrainDescription) {
                return 0;
            }
            return this.getPenalty(tile, tileType, terrainDescription);
        }
        getValidPoints(island, point, moveAdjacentToTarget) {
            if (!moveAdjacentToTarget) {
                return !this.isDisabledFromPoint(island, point) ? [point] : [];
            }
            const points = [];
            let neighbor = { x: point.x + 1, y: point.y, z: point.z };
            if (!this.isDisabledFromPoint(island, neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x - 1, y: point.y, z: point.z };
            if (!this.isDisabledFromPoint(island, neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x, y: point.y + 1, z: point.z };
            if (!this.isDisabledFromPoint(island, neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x, y: point.y - 1, z: point.z };
            if (!this.isDisabledFromPoint(island, neighbor)) {
                points.push(neighbor);
            }
            return points.sort((a, b) => this.getPenaltyFromPoint(island, a) - this.getPenaltyFromPoint(island, b));
        }
        findPath(end) {
            const mapInfo = this.maps.get(end.z);
            if (!mapInfo) {
                return undefined;
            }
            if (mapInfo.dirtyDijkstra) {
                if (this.originUpdateTimeout !== undefined) {
                    window.clearTimeout(this.originUpdateTimeout);
                    this.originUpdateTimeout = undefined;
                }
                this.updateOrigin();
            }
            const response = {
                success: false,
                path: [],
                score: 0,
                endX: end.x,
                endY: end.y,
            };
            mapInfo.dijkstraMap.findPath2(response);
            if (response.success) {
                return {
                    path: response.path.map(node => ({
                        x: node.x,
                        y: node.y,
                        z: end.z,
                    })),
                    score: response.score,
                };
            }
            return undefined;
        }
        isDisabled(tile, tileType = tile.type, skipCache) {
            if (!skipCache) {
                const cacheId = `${tile.x},${tile.y},${tile.z}`;
                const result = this.nodeDisableCache.get(cacheId);
                if (result !== undefined) {
                    return result;
                }
            }
            if (tileType === ITerrain_1.TerrainType.Void) {
                return true;
            }
            if (tile.npc !== undefined && tile.npc !== this.human) {
                return true;
            }
            const doodad = tile.doodad;
            if (doodad !== undefined) {
                const description = doodad.description();
                if (!description) {
                    return true;
                }
                if (!description.isDoor &&
                    !description.isGate &&
                    !description.isWall &&
                    !description.isTree &&
                    (doodad.blocksMove() || doodad.isDangerous(this.human)) &&
                    !doodad.isVehicle()) {
                    return true;
                }
            }
            if (tile.creature && tile.creature.isTamed() && !tile.creature.canSwapWith(this.human, undefined)) {
                return true;
            }
            const players = tile.getPlayersOnTile(false, true);
            if (players.length > 0) {
                for (const player of players) {
                    if (player !== this.human) {
                        return true;
                    }
                }
            }
            return false;
        }
        getPenalty(tile, tileType = tile.type, terrainDescription = tile.description(), tileUpdateType, skipCache) {
            if (!skipCache) {
                const cacheId = `${tile.x},${tile.y},${tile.z}`;
                const result = this.nodePenaltyCache.get(cacheId);
                if (result !== undefined) {
                    return result;
                }
            }
            let penalty = 0;
            if (tileType === ITerrain_1.TerrainType.Lava || tile.events?.some(tileEvent => tileEvent.type === ITileEvent_1.TileEventType.Fire || tileEvent.type === ITileEvent_1.TileEventType.Acid)) {
                penalty += 150;
            }
            if (tileType === ITerrain_1.TerrainType.CaveEntrance) {
                penalty += 255;
            }
            if (tileUpdateType === undefined || tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn) {
                if (tile.creature) {
                    penalty += tile.creature.isTamed() ? 10 : 120;
                }
                const island = tile.island;
                for (let x = -exports.creaturePenaltyRadius; x <= exports.creaturePenaltyRadius; x++) {
                    for (let y = -exports.creaturePenaltyRadius; y <= exports.creaturePenaltyRadius; y++) {
                        const point = island.ensureValidPoint({ x: tile.x + x, y: tile.y + y, z: tile.z });
                        if (point) {
                            const creature = island.getTileFromPoint(point).creature;
                            if (creature && !creature.isTamed() && creature.checkCreatureMove(true, tile, creature.getMoveType(), true) === 0) {
                                penalty += 10;
                                if (x === 0 && y === 0) {
                                    penalty += 8;
                                }
                                if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
                                    penalty += 8;
                                }
                                if (creature.aberrant) {
                                    penalty += 100;
                                }
                            }
                        }
                    }
                }
            }
            if (tile.doodad !== undefined) {
                const description = tile.doodad.description();
                if (description && !description.isDoor && !description.isGate) {
                    if (description.isWall) {
                        penalty += 200;
                    }
                    else if (tile.doodad.blocksMove()) {
                        penalty += 50;
                    }
                    else {
                        penalty += 4;
                    }
                }
            }
            if (terrainDescription) {
                if (terrainDescription.gather) {
                    penalty += 230;
                }
                else if (terrainDescription.shallowWater) {
                    penalty += 6;
                }
                else if (terrainDescription.water && !this.sailingMode) {
                    penalty += 20;
                }
                if (this.sailingMode && !terrainDescription.water && !terrainDescription.shallowWater) {
                    penalty += 200;
                }
            }
            return Math.min(penalty, 255);
        }
        _updateOrigin(x, y, z) {
            const mapInfo = this.maps.get(z);
            if (!mapInfo) {
                return;
            }
            mapInfo.dijkstraMap.updateOrigin(mapInfo.dijkstraMap.getNode(x, y));
            mapInfo.dirtyDijkstra = false;
        }
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBc0JhLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLFFBQUEscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQXFCLFVBQVU7UUFjOUIsWUFBNkIsR0FBUSxFQUFtQixLQUFZLEVBQW1CLE9BQW9CLEVBQW1CLE9BQTBCO1lBQTNILFFBQUcsR0FBSCxHQUFHLENBQUs7WUFBbUIsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1CO1lBWnZJLFNBQUksR0FBb0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVsRCxxQkFBZ0IsR0FBd0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsRCxxQkFBZ0IsR0FBeUIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQVVwRSxDQUFDO1FBRU0sSUFBSTtZQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBRXpCLEtBQUssSUFBSSxDQUFDLEdBQUcsZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSTtvQkFDSCxNQUFNLElBQUksR0FBdUI7d0JBQ2hDLFdBQVcsRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO3dCQUM5RCxhQUFhLEVBQUUsSUFBSTtxQkFDbkIsQ0FBQztvQkFFRixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUs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