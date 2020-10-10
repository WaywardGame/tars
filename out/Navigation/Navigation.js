define(["require", "exports", "game/WorldZ", "tile/ITerrain", "tile/ITileEvent", "tile/Terrains", "utilities/Async", "utilities/TileHelpers", "../Utilities/Logger", "./INavigation"], function (require, exports, WorldZ_1, ITerrain_1, ITileEvent_1, Terrains_1, Async_1, TileHelpers_1, Logger_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workerCount = 1;
    class Navigation {
        constructor() {
            this.totalTime = 0;
            this.totalCount = 0;
            this.overlayAlpha = 0;
            this.dijkstraMaps = new Map();
            this.navigationWorkers = [];
            this.overlay = new Map();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                try {
                    this.dijkstraMaps.set(z, new Module.DijkstraMap());
                }
                catch (ex) {
                    Logger_1.log.error("Failed to create dijkstraMap", ex);
                    this.dijkstraMaps.delete(z);
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
                const worker = new Worker(`${Navigation.modPath}\\out\\Navigation\\NavigationWorker.js`);
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
            for (const [z, zMap] of this.overlay.entries()) {
                for (const [y, yMap] of zMap.entries()) {
                    for (const [x, overlay] of yMap.entries()) {
                        TileHelpers_1.default.Overlay.remove(game.getTile(x, y, z), overlay);
                    }
                }
            }
            this.overlay.clear();
        }
        updateOverlayAlpha(alpha) {
            this.overlayAlpha = alpha;
            for (const [, zMap] of this.overlay.entries()) {
                for (const [, yMap] of zMap.entries()) {
                    for (const [, overlay] of yMap.entries()) {
                        overlay.alpha = this.overlayAlpha;
                    }
                }
            }
        }
        async updateAll() {
            Logger_1.log.info("Updating navigation. Please wait...");
            const array = new Uint8Array(game.mapSizeSq * this.dijkstraMaps.size * 3);
            const start = performance.now();
            for (let z = WorldZ_1.WorldZ.Min; z <= WorldZ_1.WorldZ.Max; z++) {
                for (let x = 0; x < game.mapSize; x++) {
                    for (let y = 0; y < game.mapSize; y++) {
                        const tile = game.getTile(x, y, z);
                        this.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, z, array);
                    }
                }
            }
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
                this.originUpdateTimeout = setTimeout(() => {
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
        onTileUpdate(tile, tileType, x, y, z, array) {
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const dijkstraMapInstance = this.dijkstraMaps.get(z);
            if (!dijkstraMapInstance) {
                return;
            }
            const isDisabled = this.isDisabled(tile, x, y, z, tileType);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription);
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
            else {
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
                    tile: game.getTileFromPoint(nearestPoint),
                };
            });
        }
        isDisabledFromPoint(point) {
            if (!game.ensureValidPoint(point)) {
                return true;
            }
            const tile = game.getTileFromPoint(point);
            const tileType = TileHelpers_1.default.getType(tile);
            return this.isDisabled(tile, point.x, point.y, point.z, tileType);
        }
        getPenaltyFromPoint(point) {
            const tile = game.getTileFromPoint(point);
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
            return points.sort((a, b) => {
                const penaltyA = this.getPenaltyFromPoint(a);
                const penaltyB = this.getPenaltyFromPoint(b);
                if (penaltyA === penaltyB) {
                    return 0;
                }
                return penaltyA > penaltyB ? 1 : -1;
            });
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
                await Async_1.sleep(1);
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
            if (tile.creature && tile.creature.isTamed() && !tile.creature.canSwapWith(localPlayer)) {
                return true;
            }
            const players = game.getPlayersAtPosition(x, y, z, false, true);
            if (players.length > 0) {
                for (const player of players) {
                    if (!player.isLocalPlayer()) {
                        return true;
                    }
                }
            }
            return false;
        }
        getPenalty(tile, tileX, tileY, tileZ, tileType, terrainDescription) {
            let penalty = 0;
            if (tileType === ITerrain_1.TerrainType.Lava || tileEventManager.get(tile, ITileEvent_1.TileEventType.Fire)) {
                penalty += 150;
            }
            if (tileType === ITerrain_1.TerrainType.CaveEntrance) {
                penalty += 255;
            }
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    const point = game.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                    if (point) {
                        const otherTile = game.getTileFromPoint(point);
                        if (otherTile.creature && !otherTile.creature.isTamed()) {
                            penalty += (x === 0 && y === 0) ? 36 : 20;
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
            else if (terrainDescription.water) {
                penalty += 20;
            }
            return Math.min(penalty, 255);
        }
        addOrUpdateOverlay(tile, tileX, tileY, tileZ, isDisabled, penalty) {
            let zMap = this.overlay.get(tileZ);
            if (!zMap) {
                zMap = new Map();
                this.overlay.set(tileZ, zMap);
            }
            let yMap = zMap.get(tileY);
            if (!yMap) {
                yMap = new Map();
                zMap.set(tileY, yMap);
            }
            let overlay = yMap.get(tileX);
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
                yMap.set(tileX, overlay);
                TileHelpers_1.default.Overlay.add(tile, overlay);
            }
        }
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9OYXZpZ2F0aW9uL05hdmlnYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBb0JBLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUV0QixNQUFxQixVQUFVO1FBeUM5QjtZQW5DTyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsZUFBVSxHQUFHLENBQUMsQ0FBQztZQUNmLGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1lBRVAsaUJBQVksR0FBOEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUVwRCxzQkFBaUIsR0FBd0IsRUFBRSxDQUFDO1lBRTVDLFlBQU8sR0FBd0QsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQTRCekYsS0FBSyxJQUFJLENBQUMsR0FBRyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxJQUFJO29CQUNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUNuRDtnQkFBQyxPQUFPLEVBQUUsRUFBRTtvQkFDWixZQUFHLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDNUI7YUFDRDtZQUVELElBQUksVUFBa0IsQ0FBQztZQUN2QixJQUFJO2dCQUNILFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckM7WUFBQyxPQUFPLEVBQUUsRUFBRTtnQkFDWixNQUFNLFlBQVksR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFFcEUsVUFBVSxH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