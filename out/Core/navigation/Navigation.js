define(["require", "exports", "game/tile/ITerrain", "game/tile/ITileEvent", "game/tile/Terrains", "game/WorldZ", "utilities/enum/Enums", "utilities/game/TileHelpers", "utilities/promise/Async", "game/IGame", "../../utilities/Logger", "./INavigation"], function (require, exports, ITerrain_1, ITileEvent_1, Terrains_1, WorldZ_1, Enums_1, TileHelpers_1, Async_1, IGame_1, Logger_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creaturePenaltyRadius = exports.tileUpdateRadius = void 0;
    const workerCount = 1;
    exports.tileUpdateRadius = 2;
    exports.creaturePenaltyRadius = 2;
    class Navigation {
        constructor(overlay) {
            this.overlay = overlay;
            this.totalTime = 0;
            this.totalCount = 0;
            this.dijkstraMaps = new Map();
            this.navigationWorkers = [];
            this.sailingMode = false;
            this.workerInitialized = false;
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                try {
                    this.dijkstraMaps.set(z, new Module.DijkstraMap());
                }
                catch (ex) {
                    Logger_1.log.error("Failed to create dijkstraMap", ex);
                    this.dijkstraMaps.delete(z);
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
            Logger_1.log.info(`Creating ${workerCount} navigation workers`);
            for (let i = 0; i < workerCount; i++) {
                const worker = new Worker(`${Navigation.modPath}\\out\\core\\navigation\\NavigationWorker.js`);
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
        }
        static setModPath(modPath) {
            Navigation.modPath = modPath;
        }
        delete() {
            for (const dijkstraMap of this.dijkstraMaps.values()) {
                try {
                    dijkstraMap.delete();
                }
                catch (ex) {
                    Logger_1.log.error(`Failed to delete dijkstra map: ${ex}`);
                }
            }
            this.dijkstraMaps.clear();
            for (const navigationWorker of this.navigationWorkers) {
                navigationWorker.worker.terminate();
            }
            this.navigationWorkers.length = 0;
            this.overlay.clear();
        }
        shouldUpdateSailingMode(sailingMode) {
            return this.sailingMode !== sailingMode;
        }
        async updateAll(sailingMode) {
            Logger_1.log.info("Updating navigation. Please wait...");
            this.sailingMode = sailingMode;
            const skipWorkerUpdate = this.workerInitialized;
            const array = !skipWorkerUpdate ? new Uint8Array(game.mapSizeSq * this.dijkstraMaps.size * 3) : undefined;
            const start = performance.now();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                for (let x = 0; x < game.mapSize; x++) {
                    for (let y = 0; y < game.mapSize; y++) {
                        const tile = localIsland.getTile(x, y, z);
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
            Logger_1.log.info(`Updated navigation in ${time}ms`);
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
            const dijkstraMapInstance = this.dijkstraMaps.get(this.origin.z);
            if (!dijkstraMapInstance) {
                return;
            }
            dijkstraMapInstance.updateOrigin(dijkstraMapInstance.getNode(this.origin.x, this.origin.y));
        }
        refreshOverlay(tile, x, y, z, isBaseTile, isDisabled, penalty, tileType, terrainDescription, tileUpdateType) {
            tileType !== null && tileType !== void 0 ? tileType : (tileType = TileHelpers_1.default.getType(tile));
            terrainDescription !== null && terrainDescription !== void 0 ? terrainDescription : (terrainDescription = Terrains_1.default[tileType]);
            if (!terrainDescription) {
                return;
            }
            this.overlay.addOrUpdate(tile, x, y, z, isBaseTile, isDisabled !== null && isDisabled !== void 0 ? isDisabled : this.isDisabled(tile, x, y, z, tileType), penalty !== null && penalty !== void 0 ? penalty : this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType));
        }
        onTileUpdate(tile, tileType, x, y, z, isBaseTile, array, tileUpdateType, skipWorkerUpdate) {
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const dijkstraMapInstance = this.dijkstraMaps.get(z);
            if (!dijkstraMapInstance) {
                return;
            }
            const isDisabled = this.isDisabled(tile, x, y, z, tileType);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType);
            this.refreshOverlay(tile, x, y, z, isBaseTile !== null && isBaseTile !== void 0 ? isBaseTile : false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);
            try {
                const node = dijkstraMapInstance.getNode(x, y);
                node.penalty = penalty;
                node.disabled = isDisabled;
            }
            catch (ex) {
                Logger_1.log.error("invalid node", x, y, penalty, isDisabled);
                console.trace();
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
                const tile = localIsland.getTileFromPoint(nearestPoint);
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
            if (!localIsland.ensureValidPoint(point)) {
                return true;
            }
            const tile = localIsland.getTileFromPoint(point);
            const tileType = TileHelpers_1.default.getType(tile);
            return this.isDisabled(tile, point.x, point.y, point.z, tileType);
        }
        getPenaltyFromPoint(point, tile = localIsland.getTileFromPoint(point)) {
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return 0;
            }
            return this.getPenalty(tile, point.x, point.y, point.z, tileType, terrainDescription);
        }
        getValidPoints(point, onlyIncludePoint) {
            if (onlyIncludePoint && !this.isDisabledFromPoint(point)) {
                return [point];
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
            const dijkstraMap = this.dijkstraMaps.get(end.z);
            if (!dijkstraMap) {
                return undefined;
            }
            const response = {
                success: false,
                path: [],
                score: 0,
                endX: end.x,
                endY: end.y,
            };
            dijkstraMap.findPath2(response);
            if (response.path !== undefined && response.score !== undefined) {
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
                Logger_1.log.info(`No pending requests for ${INavigation_1.NavigationMessageType[data.type]}`, data);
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
                Logger_1.log.warn(`No matching request for ${INavigation_1.NavigationMessageType[data.type]}`, data);
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
        isDisabled(tile, x, y, z, tileType) {
            if (tile.npc !== undefined) {
                return true;
            }
            if (tile.doodad !== undefined) {
                const description = tile.doodad.description();
                if (!description) {
                    return true;
                }
                if (!description.isDoor &&
                    !description.isGate &&
                    !description.isWall &&
                    !description.isTree &&
                    (tile.doodad.blocksMove() || tile.doodad.isDangerous(localPlayer))) {
                    return true;
                }
            }
            if (tile.creature && tile.creature.isTamed() && !tile.creature.canSwapWith(localPlayer, undefined)) {
                return true;
            }
            const players = localIsland.getPlayersAtPosition(x, y, z, false, true);
            if (players.length > 0) {
                for (const player of players) {
                    if (!player.isLocalPlayer()) {
                        return true;
                    }
                }
            }
            return false;
        }
        getPenalty(tile, tileX, tileY, tileZ, tileType, terrainDescription, tileUpdateType) {
            var _a;
            let penalty = 0;
            if (tileType === ITerrain_1.TerrainType.Lava || ((_a = tile.events) === null || _a === void 0 ? void 0 : _a.some(tileEvent => tileEvent.type === ITileEvent_1.TileEventType.Fire || tileEvent.type === ITileEvent_1.TileEventType.Acid))) {
                penalty += 150;
            }
            if (tileType === ITerrain_1.TerrainType.CaveEntrance) {
                penalty += 255;
            }
            if (tileUpdateType === undefined || tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn) {
                for (let x = -exports.creaturePenaltyRadius; x <= exports.creaturePenaltyRadius; x++) {
                    for (let y = -exports.creaturePenaltyRadius; y <= exports.creaturePenaltyRadius; y++) {
                        const point = localIsland.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                        if (point) {
                            const creature = localIsland.getTileFromPoint(point).creature;
                            if (creature && !creature.isTamed()) {
                                penalty += 20;
                                if (x === 0 && y === 0) {
                                    penalty += 16;
                                }
                                if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
                                    penalty += 16;
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
                        penalty += 15;
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
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMEJBLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUVULFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLFFBQUEscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQXFCLFVBQVU7UUF1QjlCLFlBQTZCLE9BQW9CO1lBQXBCLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFuQjFDLGNBQVMsR0FBRyxDQUFDLENBQUM7WUFDZCxlQUFVLEdBQUcsQ0FBQyxDQUFDO1lBRUwsaUJBQVksR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVwRCxzQkFBaUIsR0FBd0IsRUFBRSxDQUFDO1lBTXJELGdCQUFXLEdBQUcsS0FBSyxDQUFDO1lBRXBCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQU9qQyxLQUFLLElBQUksQ0FBQyxHQUFHLGVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLGVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzlDLElBQUk7b0JBQ0gsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQ25EO2dCQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNaLFlBQUcsQ0FBQyxLQUFLLENBQUMsOEJBQThCLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQzlDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1lBRUQsTUFBTSxlQUFlLEdBQWtCLEVBQUUsQ0FBQztZQUMxQyxNQUFNLGFBQWEsR0FBa0IsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sZUFBZSxHQUFrQixFQUFFLENBQUM7WUFFMUMsS0FB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