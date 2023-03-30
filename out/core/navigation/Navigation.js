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