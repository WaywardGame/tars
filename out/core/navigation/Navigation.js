define(["require", "exports", "game/tile/ITerrain", "game/tile/ITileEvent", "game/tile/Terrains", "game/WorldZ", "utilities/enum/Enums", "utilities/game/TileHelpers", "utilities/promise/Async", "game/IGame", "./INavigation"], function (require, exports, ITerrain_1, ITileEvent_1, Terrains_1, WorldZ_1, Enums_1, TileHelpers_1, Async_1, IGame_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creaturePenaltyRadius = exports.tileUpdateRadius = void 0;
    const workerCount = 1;
    exports.tileUpdateRadius = 2;
    exports.creaturePenaltyRadius = 2;
    class Navigation {
        constructor(log, human, overlay) {
            this.log = log;
            this.human = human;
            this.overlay = overlay;
            this.maps = new Map();
            this.navigationWorkers = [];
            this.nodePenaltyCache = new Map();
            this.nodeDisableCache = new Map();
        }
        static setModPath(modPath) {
            Navigation.modPath = modPath;
        }
        load() {
            this.unload();
            this.origin = undefined;
            this.sailingMode = false;
            this.workerInitialized = false;
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                try {
                    this.maps.set(z, {
                        dijkstraMap: new Module.DijkstraMap(),
                        dirty: true,
                    });
                }
                catch (ex) {
                    this.log.error("Failed to create dijkstraMap", ex);
                    this.maps.delete(z);
                }
            }
            const freshWaterTypes = [];
            const seaWaterTypes = [];
            const gatherableTypes = [];
            for (const tileType of Enums_1.default.values(ITerrain_1.TerrainType)) {
                const tileTypeName = ITerrain_1.TerrainType[tileType];
                const terrainDescription = Terrains_1.default[tileType];
                if (!terrainDescription || terrainDescription.ice) {
                    continue;
                }
                if (tileTypeName.includes("FreshWater")) {
                    freshWaterTypes.push(tileType);
                }
                else if (tileTypeName.includes("Seawater")) {
                    seaWaterTypes.push(tileType);
                }
                if (terrainDescription.gather) {
                    gatherableTypes.push(tileType);
                }
            }
            let pathPrefix;
            try {
                pathPrefix = steamworks.getAppPath();
            }
            catch (ex) {
                const slashesCount = (Navigation.modPath.match(/\//g) || []).length;
                pathPrefix = "..\\..\\..\\..\\";
                for (let i = 0; i < slashesCount; i++) {
                    pathPrefix += "..\\";
                }
            }
            let navigationWorkerPath = `${Navigation.modPath}\\out\\core\\navigation\\NavigationWorker.js`;
            if (isWebWorker) {
                navigationWorkerPath = `..\\..\\..\\..\\${navigationWorkerPath}`;
            }
            for (let i = 0; i < workerCount; i++) {
                const worker = new Worker(navigationWorkerPath);
                this.navigationWorkers[i] = {
                    id: i,
                    worker: worker,
                    busy: false,
                    pendingRequests: {},
                };
                worker.onmessage = (event) => {
                    this.onWorkerMessage(this.navigationWorkers[i], event);
                };
                worker.postMessage({
                    pathPrefix: pathPrefix,
                    mapSize: game.mapSize,
                    mapSizeSq: game.mapSizeSq,
                    freshWaterTypes,
                    seaWaterTypes,
                    gatherableTypes,
                });
            }
            this.log.info(`Created ${workerCount} navigation workers`);
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
            for (const navigationWorker of this.navigationWorkers) {
                navigationWorker.worker.terminate();
            }
            this.navigationWorkers.length = 0;
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
            const skipWorkerUpdate = this.workerInitialized;
            const array = !skipWorkerUpdate ? new Uint8Array(game.mapSizeSq * this.maps.size * 3) : undefined;
            const island = this.human.island;
            const start = performance.now();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                for (let x = 0; x < game.mapSize; x++) {
                    for (let y = 0; y < game.mapSize; y++) {
                        const tile = island.getTile(x, y, z);
                        this.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, z, false, array, undefined, skipWorkerUpdate);
                    }
                }
            }
            if (array) {
                const promises = [];
                for (const navigationWorker of this.navigationWorkers) {
                    const messageArray = new Uint8Array(array.buffer.slice(0));
                    const updateAllTilesMessage = {
                        type: INavigation_1.NavigationMessageType.UpdateAllTiles,
                        array: messageArray,
                    };
                    promises.push(this.submitRequest(updateAllTilesMessage, navigationWorker.id, [messageArray.buffer]));
                }
                await Promise.all(promises);
                this.workerInitialized = true;
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
        async updateOrigin(origin) {
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
            const nearestCaveEntrances = await this.getNearestTileLocation(ITerrain_1.TerrainType.CaveEntrance, this.origin);
            const nearestCaveEntrance = nearestCaveEntrances[0];
            if (nearestCaveEntrance) {
                const { x, y } = nearestCaveEntrance.point;
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
        refreshOverlay(tile, x, y, z, isBaseTile, isDisabled, penalty, tileType, terrainDescription, tileUpdateType) {
            tileType ??= TileHelpers_1.default.getType(tile);
            terrainDescription ??= Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            this.overlay.addOrUpdate(tile, x, y, z, isBaseTile, isDisabled ?? this.isDisabled(tile, x, y, z, tileType), penalty ?? this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType));
        }
        onTileUpdate(tile, tileType, x, y, z, isBaseTile, array, tileUpdateType, skipWorkerUpdate) {
            const mapInfo = this.maps.get(z);
            if (!mapInfo) {
                return;
            }
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const cacheId = `${x},${y},${z}`;
            const isDisabled = this.isDisabled(tile, x, y, z, tileType, true);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType, true);
            this.nodeDisableCache.set(cacheId, isDisabled);
            this.nodePenaltyCache.set(cacheId, penalty);
            this.refreshOverlay(tile, x, y, z, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);
            try {
                mapInfo.dirty = true;
                mapInfo.dijkstraMap.updateNode(x, y, penalty, isDisabled);
            }
            catch (ex) {
                this.log.trace("invalid node", x, y, penalty, isDisabled);
            }
            if (array) {
                const index = (z * game.mapSizeSq * 3) + (y * game.mapSize * 3) + x * 3;
                array[index] = isDisabled ? 1 : 0;
                array[index + 1] = penalty;
                array[index + 2] = tileType;
            }
            else if (!skipWorkerUpdate) {
                const updateTileMessage = {
                    type: INavigation_1.NavigationMessageType.UpdateTile,
                    pos: { x, y, z },
                    disabled: isDisabled,
                    penalty: penalty,
                    tileType: tileType,
                };
                for (const navigationWorker of this.navigationWorkers) {
                    navigationWorker.worker.postMessage(updateTileMessage);
                }
                this.queueUpdateOrigin();
            }
        }
        async getNearestTileLocation(tileType, point) {
            const getTileLocationsMessage = {
                type: INavigation_1.NavigationMessageType.GetTileLocations,
                tileType: tileType,
                pos: { x: point.x, y: point.y, z: point.z },
            };
            const response = await this.submitRequest(getTileLocationsMessage);
            return response.result.map(p => {
                const nearestPoint = {
                    ...p,
                    z: point.z,
                };
                const tile = this.human.island.getTileFromPoint(nearestPoint);
                if (!tile) {
                    throw new Error(`Invalid point ${nearestPoint.x},${nearestPoint.y}`);
                }
                return {
                    type: tileType,
                    point: nearestPoint,
                    tile,
                };
            });
        }
        isDisabledFromPoint(point) {
            if (!this.human.island.ensureValidPoint(point)) {
                return true;
            }
            const tile = this.human.island.getTileFromPoint(point);
            const tileType = TileHelpers_1.default.getType(tile);
            return this.isDisabled(tile, point.x, point.y, point.z, tileType);
        }
        getPenaltyFromPoint(point, tile = this.human.island.getTileFromPoint(point)) {
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return 0;
            }
            return this.getPenalty(tile, point.x, point.y, point.z, tileType, terrainDescription);
        }
        getValidPoints(point, moveAdjacentToTarget) {
            if (!moveAdjacentToTarget) {
                return !this.isDisabledFromPoint(point) ? [point] : [];
            }
            const points = [];
            let neighbor = { x: point.x + 1, y: point.y, z: point.z };
            if (!this.isDisabledFromPoint(neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x - 1, y: point.y, z: point.z };
            if (!this.isDisabledFromPoint(neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x, y: point.y + 1, z: point.z };
            if (!this.isDisabledFromPoint(neighbor)) {
                points.push(neighbor);
            }
            neighbor = { x: point.x, y: point.y - 1, z: point.z };
            if (!this.isDisabledFromPoint(neighbor)) {
                points.push(neighbor);
            }
            return points.sort((a, b) => this.getPenaltyFromPoint(a) - this.getPenaltyFromPoint(b));
        }
        async findPath(end) {
            const mapInfo = this.maps.get(end.z);
            if (!mapInfo) {
                return undefined;
            }
            if (mapInfo.dirty) {
                if (this.originUpdateTimeout !== undefined) {
                    window.clearTimeout(this.originUpdateTimeout);
                    this.originUpdateTimeout = undefined;
                }
                await this.updateOrigin();
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
        onWorkerMessage(navigationWorker, event) {
            const data = event.data;
            const pendingRequests = navigationWorker.pendingRequests[data.type];
            if (!pendingRequests || pendingRequests.length === 0) {
                this.log.info(`No pending requests for ${INavigation_1.NavigationMessageType[data.type]}`, data);
                return;
            }
            let resolve;
            switch (data.type) {
                case INavigation_1.NavigationMessageType.UpdateAllTiles:
                    resolve = pendingRequests.pop().resolve;
                    break;
                case INavigation_1.NavigationMessageType.GetTileLocations:
                    for (let i = 0; i < pendingRequests.length; i++) {
                        const info = pendingRequests[i];
                        const pos = info.request.pos;
                        if (pos.x === data.pos.x && pos.y === data.pos.y && pos.z === data.pos.z) {
                            resolve = info.resolve;
                            pendingRequests.splice(i, 1);
                            break;
                        }
                    }
                    break;
            }
            if (resolve) {
                resolve(data);
            }
            else {
                this.log.warn(`No matching request for ${INavigation_1.NavigationMessageType[data.type]}`, data);
            }
        }
        async submitRequest(request, targetWorkerId, transfer) {
            if (targetWorkerId === undefined) {
                for (const navigationWorker of this.navigationWorkers) {
                    if (!navigationWorker.busy) {
                        targetWorkerId = navigationWorker.id;
                        break;
                    }
                }
            }
            if (targetWorkerId === undefined) {
                await (0, Async_1.sleep)(1);
                return this.submitRequest(request, targetWorkerId, transfer);
            }
            const navigationWorker = this.navigationWorkers[targetWorkerId];
            navigationWorker.busy = true;
            if (!navigationWorker.pendingRequests[request.type]) {
                navigationWorker.pendingRequests[request.type] = [];
            }
            const response = await new Promise(resolve2 => {
                navigationWorker.pendingRequests[request.type].push({ request, resolve: resolve2 });
                if (transfer) {
                    navigationWorker.worker.postMessage(request, transfer);
                }
                else {
                    navigationWorker.worker.postMessage(request);
                }
            });
            navigationWorker.busy = false;
            return response;
        }
        isDisabled(tile, x, y, z, tileType, skipCache) {
            if (!skipCache) {
                const cacheId = `${x},${y},${z}`;
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
            const players = this.human.island.getPlayersAtPosition(x, y, z, false, true);
            if (players.length > 0) {
                for (const player of players) {
                    if (player !== this.human) {
                        return true;
                    }
                }
            }
            return false;
        }
        getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType, skipCache) {
            if (!skipCache) {
                const cacheId = `${x},${y},${z}`;
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
                for (let x = -exports.creaturePenaltyRadius; x <= exports.creaturePenaltyRadius; x++) {
                    for (let y = -exports.creaturePenaltyRadius; y <= exports.creaturePenaltyRadius; y++) {
                        const point = this.human.island.ensureValidPoint({ x: x + x, y: y + y, z: z });
                        if (point) {
                            const creature = this.human.island.getTileFromPoint(point).creature;
                            if (creature && !creature.isTamed() && creature.checkCreatureMove(true, x, y, z, tile, creature.getMoveType(), true) === 0) {
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
            return Math.min(penalty, 255);
        }
        _updateOrigin(x, y, z) {
            const mapInfo = this.maps.get(z);
            if (!mapInfo) {
                return;
            }
            mapInfo.dijkstraMap.updateOrigin(mapInfo.dijkstraMap.getNode(x, y));
            mapInfo.dirty = false;
        }
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMEJBLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUVULFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLFFBQUEscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQXFCLFVBQVU7UUEwQjlCLFlBQTZCLEdBQVEsRUFBbUIsS0FBWSxFQUFtQixPQUFvQjtZQUE5RSxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQW1CLFVBQUssR0FBTCxLQUFLLENBQU87WUFBbUIsWUFBTyxHQUFQLE9BQU8sQ0FBYTtZQW5CMUYsU0FBSSxHQUErRCxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTdFLHNCQUFpQixHQUF3QixFQUFFLENBQUM7WUFFNUMscUJBQWdCLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDbEQscUJBQWdCLEdBQXlCLElBQUksR0FBRyxFQUFFLENBQUM7UUFlcEUsQ0FBQztRQUxNLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBZTtZQUN2QyxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM5QixDQUFDO1FBS00sSUFBSTtZQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFFL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxJQUFJO29CQUNILElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTt3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