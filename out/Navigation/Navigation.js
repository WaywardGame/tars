define(["require", "exports", "game/tile/ITerrain", "game/tile/ITileEvent", "game/tile/Terrains", "game/WorldZ", "utilities/enum/Enums", "utilities/game/TileHelpers", "utilities/promise/Async", "game/IGame", "../utilities/Logger", "./INavigation"], function (require, exports, ITerrain_1, ITileEvent_1, Terrains_1, WorldZ_1, Enums_1, TileHelpers_1, Async_1, IGame_1, Logger_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creaturePenaltyRadius = exports.tileUpdateRadius = void 0;
    const workerCount = 1;
    exports.tileUpdateRadius = 2;
    exports.creaturePenaltyRadius = 2;
    class Navigation {
        constructor() {
            this.totalTime = 0;
            this.totalCount = 0;
            this.overlayAlpha = 0;
            this.dijkstraMaps = new Map();
            this.navigationWorkers = [];
            this.overlay = new Map();
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
                pathPrefix = "..\\..\\..\\";
                for (let i = 0; i < slashesCount; i++) {
                    pathPrefix += "..\\";
                }
            }
            Logger_1.log.info(`Creating ${workerCount} navigation workers`);
            for (let i = 0; i < workerCount; i++) {
                const worker = new Worker(`${Navigation.modPath}\\out\\navigation\\NavigationWorker.js`);
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
        static get() {
            if (!Navigation.instance) {
                Navigation.instance = new Navigation();
                Logger_1.log.info("Created navigation instance");
            }
            return Navigation.instance;
        }
        static delete() {
            if (Navigation.instance) {
                Navigation.instance.delete();
                Navigation.instance = undefined;
                Logger_1.log.info("Deleted navigation instance");
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
            this.deleteOverlay();
        }
        showOverlay() {
            this.updateOverlayAlpha(150);
        }
        hideOverlay() {
            this.updateOverlayAlpha(0);
        }
        deleteOverlay() {
            for (const [key, overlay] of this.overlay.entries()) {
                const [x, y, z] = key.split(",");
                TileHelpers_1.default.Overlay.remove(localIsland.getTile(parseInt(x, 10), parseInt(y, 10), parseInt(z, 10)), overlay);
            }
            this.overlay.clear();
        }
        updateOverlayAlpha(alpha) {
            this.overlayAlpha = alpha;
            for (const [, overlay] of this.overlay.entries()) {
                overlay.alpha = this.overlayAlpha;
            }
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
                        this.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, z, array, undefined, skipWorkerUpdate);
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
        onTileUpdate(tile, tileType, x, y, z, array, tileUpdateType, skipWorkerUpdate) {
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
            this.addOrUpdateOverlay(tile, x, y, z, isDisabled, penalty);
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
                return {
                    type: tileType,
                    point: nearestPoint,
                    tile: localIsland.getTileFromPoint(nearestPoint),
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
        addOrUpdateOverlay(tile, tileX, tileY, tileZ, isDisabled, penalty) {
            const key = `${tileX},${tileY},${tileZ}`;
            let overlay = this.overlay.get(key);
            if (overlay) {
                TileHelpers_1.default.Overlay.remove(tile, overlay);
            }
            if (isDisabled || penalty !== 0) {
                overlay = {
                    type: ITerrain_1.OverlayType.Arrows,
                    size: 16,
                    offsetX: 0,
                    offsetY: 48,
                    red: isDisabled ? 0 : Math.min(penalty, 255),
                    green: isDisabled ? 0 : 255,
                    blue: 0,
                    alpha: this.overlayAlpha,
                };
                this.overlay.set(key, overlay);
                TileHelpers_1.default.Overlay.add(tile, overlay);
            }
            else if (overlay) {
                this.overlay.delete(key);
            }
        }
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9uYXZpZ2F0aW9uL05hdmlnYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQXVCQSxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFFVCxRQUFBLGdCQUFnQixHQUFHLENBQUMsQ0FBQztJQUVyQixRQUFBLHFCQUFxQixHQUFHLENBQUMsQ0FBQztJQUV2QyxNQUFxQixVQUFVO1FBNkM5QjtZQXZDTyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsZUFBVSxHQUFHLENBQUMsQ0FBQztZQUNmLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1lBRVAsaUJBQVksR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVwRCxzQkFBaUIsR0FBd0IsRUFBRSxDQUFDO1lBRTVDLFlBQU8sR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQU14RCxnQkFBVyxHQUFHLEtBQUssQ0FBQztZQUVwQixzQkFBaUIsR0FBRyxLQUFLLENBQUM7WUF3QmpDLEtBQUssSUFBSSxDQUFDLEdBQUcsZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksZUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSTtvQkFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztpQkFDbkQ7Z0JBQUMsT0FBTyxFQUFFLEVBQUU7b0JBQ1osWUFBRyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzVCO2FBQ0Q7WUFFRCxNQUFNLGVBQWUsR0FBa0IsRUFBRSxDQUFDO1lBQzFDLE1BQU0sYUFBYSxHQUFrQixFQUFFLENBQUM7WUFDeEMsTUFBTSxlQUFlLEdBQWtCLEVB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