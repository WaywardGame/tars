define(["require", "exports", "game/tile/ITerrain", "game/tile/ITileEvent", "game/tile/Terrains", "game/WorldZ", "utilities/enum/Enums", "utilities/game/TileHelpers", "utilities/promise/Async", "game/IGame", "../../utilities/Logger", "./INavigation"], function (require, exports, ITerrain_1, ITileEvent_1, Terrains_1, WorldZ_1, Enums_1, TileHelpers_1, Async_1, IGame_1, Logger_1, INavigation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.creaturePenaltyRadius = exports.tileUpdateRadius = void 0;
    const workerCount = 1;
    exports.tileUpdateRadius = 2;
    exports.creaturePenaltyRadius = 2;
    class Navigation {
        constructor(human, overlay) {
            this.human = human;
            this.overlay = overlay;
            this.dijkstraMaps = new Map();
            this.navigationWorkers = [];
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
            Logger_1.log.info(`Created ${workerCount} navigation workers`);
        }
        unload() {
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
            if (this.originUpdateTimeout !== undefined) {
                window.clearTimeout(this.originUpdateTimeout);
                this.originUpdateTimeout = undefined;
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
        async processQueuedOriginUpdate() {
            if (this.originUpdateTimeout !== undefined) {
                window.clearTimeout(this.originUpdateTimeout);
                await this.updateOrigin();
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
            switch (this.origin.z) {
                case WorldZ_1.WorldZ.Overworld:
                    return WorldZ_1.WorldZ.Cave;
                case WorldZ_1.WorldZ.Cave:
                    return WorldZ_1.WorldZ.Overworld;
            }
            return undefined;
        }
        getOppositeOrigin() {
            return this.oppositeOrigin;
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
            const dijkstraMapInstance = this.dijkstraMaps.get(z);
            if (!dijkstraMapInstance) {
                return;
            }
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const isDisabled = this.isDisabled(tile, x, y, z, tileType);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription, tileUpdateType);
            this.refreshOverlay(tile, x, y, z, isBaseTile ?? false, isDisabled, penalty, tileType, terrainDescription, tileUpdateType);
            try {
                dijkstraMapInstance.updateNode(x, y, penalty, isDisabled);
            }
            catch (ex) {
                Logger_1.log.trace("invalid node", x, y, penalty, isDisabled);
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
            if (tileType === ITerrain_1.TerrainType.Void) {
                return true;
            }
            if (tile.npc !== undefined && tile.npc !== this.human) {
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
                    (tile.doodad.blocksMove() || tile.doodad.isDangerous(this.human))) {
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
        getPenalty(tile, tileX, tileY, tileZ, tileType, terrainDescription, tileUpdateType) {
            let penalty = 0;
            if (tileType === ITerrain_1.TerrainType.Lava || tile.events?.some(tileEvent => tileEvent.type === ITileEvent_1.TileEventType.Fire || tileEvent.type === ITileEvent_1.TileEventType.Acid)) {
                penalty += 150;
            }
            if (tileType === ITerrain_1.TerrainType.CaveEntrance) {
                penalty += 255;
            }
            if (tileUpdateType === undefined || tileUpdateType === IGame_1.TileUpdateType.Creature || tileUpdateType === IGame_1.TileUpdateType.CreatureSpawn) {
                if (tile.creature) {
                    penalty += 1;
                }
                for (let x = -exports.creaturePenaltyRadius; x <= exports.creaturePenaltyRadius; x++) {
                    for (let y = -exports.creaturePenaltyRadius; y <= exports.creaturePenaltyRadius; y++) {
                        const point = this.human.island.ensureValidPoint({ x: tileX + x, y: tileY + y, z: tileZ });
                        if (point) {
                            const creature = this.human.island.getTileFromPoint(point).creature;
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
        _updateOrigin(x, y, z) {
            const dijkstraMapInstance = this.dijkstraMaps.get(z);
            if (!dijkstraMapInstance) {
                return;
            }
            dijkstraMapInstance.updateOrigin(dijkstraMapInstance.getNode(x, y));
        }
    }
    exports.default = Navigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMkJBLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztJQUVULFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBRXJCLFFBQUEscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBRXZDLE1BQXFCLFVBQVU7UUF1QjlCLFlBQTZCLEtBQVksRUFBbUIsT0FBb0I7WUFBbkQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUFhO1lBaEIvRCxpQkFBWSxHQUE4QixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXBELHNCQUFpQixHQUF3QixFQUFFLENBQUM7UUFlN0QsQ0FBQztRQUxNLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBZTtZQUN2QyxVQUFVLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUM5QixDQUFDO1FBS00sSUFBSTtZQUNWLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBRXhCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFFL0IsS0FBSyxJQUFJLENBQUMsR0FBRyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxJQUFJO29CQUNILElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO2lCQUNuRDtnQkFBQyxPQUFPLEVBQUUsRUFBRTtvQkFDWixZQUFHLENBQUMsS0FBSyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDNUI7YUFDRDtZQUVELE1BQU0sZUFBZSxHQUFrQixFQUFFLENBQUM7WUFDMUMsTUFBTSxhQUFhLEdBQWtCLEVBQUUsQ0FBQztZQUN4QyxNQUFNLGVBQWUsR0FBa0IsRUFBRSxDQUFDO1lBRTFDLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBVyxDQUFDLEVBQUU7Z0JBQ2pELE1BQU0sWUFBWSxHQUFHLHNCQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7b0JBQ2xELFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUN4QyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUUvQjtxQkFBTSxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQzdDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzdCO2dCQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO29CQUM5QixlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUMvQjthQUNEO1lBRUQsSUFBSSxVQUFrQixDQUFDO1lBQ3ZCLElBQUk7Z0JBQ0gsVUFBVSxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQzthQUNyQztZQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNaLE1BQU0sWUFBWSxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUVwRSxVQUFVLEdBQUcsa0JBQWtCLENBQUM7Z0JBRWhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RDLFVBQVUsSUFBSSxNQUFNLENBQUM7aUJBQ3JCO2FBQ0Q7WUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLDhDQUE4QyxDQUFDLENBQUM7Z0JBRS9GLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsR0FBRztvQkFDM0IsRUFBRSxFQUFFLENBQUM7b0JBQ0wsTUFBTSxFQUFFLE1BQU07b0JBQ2QsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsZUFBZSxFQUFFLEVBQUU7aUJBQ25CLENBQUM7Z0JBRUYsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQW1CLEVBQUUsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hELENBQUMsQ0FBQztnQkFFRixNQUFNLENBQUMsV0FBVyxDQUFDO29CQUNsQixVQUFVLEVBQUUsVUFBVTtvQkFDdEIsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO29CQUNyQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7b0JBQ3pCLGVBQWU7b0JBQ2YsYUFBYTtvQkFDYixlQUFlO2lCQUNmLENBQUMsQ0FBQzthQUNIO1lBRUQsWUFBRyxDQUFDLElBQUksQ0FBQyxXQUFXLFdBQVcscUJBQXFCLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBRU0sTUFBTTtZQUNaLEtBQUssTUFBTSxXQUFXLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDckQsSUFBSTtvQkFDSCxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBRXJCO2dCQUFDLE9BQU8sRUFBRSxFQUFFO29CQUNaLFlBQUcsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxDQUFDLENBQUM7aUJBQ2xEO2FBQ0Q7WUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTFCLEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3RELGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzthQUNwQztZQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFckIsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO2dCQUMzQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxDQUFDO2FBQ3JDO1FBQ0YsQ0FBQztRQUVNLHVCQUF1QixDQUFDLFdBQW9CO1lBQ2xELE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxXQUFXLENBQUM7UUFDekMsQ0FBQztRQUVNLEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBb0I7WUFDMUMsWUFBRyxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1lBRS9CLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBRWhELE1BQU0sS0FBSyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUUxRyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUVqQyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFaEMsS0FBSyxJQUFJLENBQUMsR0FBRyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7d0JBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztxQkFDdkc7aUJBQ0Q7YUFDRDtZQUVELElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sUUFBUSxHQUF1QyxFQUFFLENBQUM7Z0JBRXhELEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3RELE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTNELE1BQU0scUJBQXFCLEdBQTJCO3dCQUNyRCxJQUFJLEVBQUUsbUNBQXFCLENBQUMsY0FBYzt3QkFDMUMsS0FBSyxFQUFFLFlBQVk7cUJBQ25CLENBQUM7b0JBRUYsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3JHO2dCQUVELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQzthQUM5QjtZQUVELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFFdkMsWUFBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixDQUFDO1FBRU0saUJBQWlCLENBQUMsTUFBaUI7WUFDekMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDeEQ7WUFFRCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDakQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztvQkFDckMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNyQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDUDtRQUNGLENBQUM7UUFFTSxLQUFLLENBQUMseUJBQXlCO1lBQ3JDLElBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFBRTtnQkFDM0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFHMUI7UUFDRixDQUFDO1FBRU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFpQjtZQUMxQyxJQUFJLE1BQU0sRUFBRTtnQkFDWCxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUN4RDtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDbEM7WUFJRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFaEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNqQyxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLE9BQU87YUFDUDtZQUlELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsc0JBQVcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sbUJBQW1CLEdBQUcsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsSUFBSSxtQkFBbUIsRUFBRTtnQkFDeEIsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7Z0JBRTNDLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFFN0gsT0FBTztpQkFDUDtnQkFFRCxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUM7Z0JBRTdDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzthQUVwQztpQkFBTTtnQkFDTixJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQzthQUNoQztRQVVGLENBQUM7UUFFRCxJQUFXLFNBQVM7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUNsQztZQUVELFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RCLEtBQUssZUFBTSxDQUFDLFNBQVM7b0JBQ3BCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQztnQkFFcEIsS0FBSyxlQUFNLENBQUMsSUFBSTtvQkFDZixPQUFPLGVBQU0sQ0FBQyxTQUFTLENBQUM7YUFDekI7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0saUJBQWlCO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO1FBRU0sY0FBYyxDQUFDLElBQVcsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxVQUFtQixFQUFFLFVBQW9CLEVBQUUsT0FBZ0IsRUFBRSxRQUFpQixFQUFFLGtCQUF3QyxFQUFFLGNBQStCO1lBQzVOLFFBQVEsS0FBSyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxrQkFBa0IsS0FBSyxrQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVyRCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUN2QixJQUFJLEVBQ0osQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLEVBQ0QsVUFBVSxFQUNWLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsRUFDdEQsT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFTSxZQUFZLENBQUMsSUFBVyxFQUFFLFFBQXFCLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsVUFBbUIsRUFBRSxLQUFrQixFQUFFLGNBQStCLEVBQUUsZ0JBQTBCO1lBQzVMLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dCQUN6QixPQUFPO2FBQ1A7WUFFRCxNQUFNLGtCQUFrQixHQUFHLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsT0FBTzthQUNQO1lBRUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRTdGLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsSUFBSSxLQUFLLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFFM0gsSUFBSTtnQkFDSCxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFJMUQ7WUFBQyxPQUFPLEVBQUUsRUFBRTtnQkFDWixZQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNyRDtZQUVELElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQzNCLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO2FBRTVCO2lCQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDN0IsTUFBTSxpQkFBaUIsR0FBdUI7b0JBQzdDLElBQUksRUFBRSxtQ0FBcUIsQ0FBQyxVQUFVO29CQUN0QyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDaEIsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLE9BQU8sRUFBRSxPQUFPO29CQUNoQixRQUFRLEVBQUUsUUFBUTtpQkFDbEIsQ0FBQztnQkFFRixLQUFLLE1BQU0sZ0JBQWdCLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO29CQUN0RCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7aUJBQ3ZEO2dCQUVELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztRQUVNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxRQUFxQixFQUFFLEtBQWU7WUFDekUsTUFBTSx1QkFBdUIsR0FBNkI7Z0JBQ3pELElBQUksRUFBRSxtQ0FBcUIsQ0FBQyxnQkFBZ0I7Z0JBQzVDLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRTthQUMzQyxDQUFDO1lBSUYsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFTbkUsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxZQUFZLEdBQUc7b0JBQ3BCLEdBQUcsQ0FBQztvQkFDSixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ1YsQ0FBQztnQkFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDOUQsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixZQUFZLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUNyRTtnQkFFRCxPQUFPO29CQUNOLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxZQUFZO29CQUNuQixJQUFJO2lCQUNhLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sbUJBQW1CLENBQUMsS0FBZTtZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9DLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2RCxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUUzQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxLQUFlLEVBQUUsT0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFDbEcsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFTSxjQUFjLENBQUMsS0FBZSxFQUFFLGdCQUF5QjtZQUMvRCxJQUFJLGdCQUFnQixJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN6RCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDZjtZQUdELE1BQU0sTUFBTSxHQUFlLEVBQUUsQ0FBQztZQUU5QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzFELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdEI7WUFFRCxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN0QjtZQUVELFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdEI7WUFFRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBYTtZQUtsQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxNQUFNLFFBQVEsR0FBK0I7Z0JBQzVDLE9BQU8sRUFBRSxLQUFLO2dCQUNkLElBQUksRUFBRSxFQUFFO2dCQUNSLEtBQUssRUFBRSxDQUFDO2dCQUNSLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDWCxDQUFDO1lBRUYsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQVNoQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7Z0JBS3JCLE9BQU87b0JBQ04sSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFXLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNULENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDVCxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7cUJBQ1IsQ0FBQyxDQUFDO29CQUNILEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztpQkFDckIsQ0FBQzthQUNGO1lBRUQsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVPLGVBQWUsQ0FBQyxnQkFBbUMsRUFBRSxLQUFtQjtZQUMvRSxNQUFNLElBQUksR0FBdUIsS0FBSyxDQUFDLElBQUksQ0FBQztZQUU1QyxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxlQUFlLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JELFlBQUcsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLG1DQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM5RSxPQUFPO2FBQ1A7WUFFRCxJQUFJLE9BQTZELENBQUM7WUFFbEUsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNsQixLQUFLLG1DQUFxQixDQUFDLGNBQWM7b0JBQ3hDLE9BQU8sR0FBRyxlQUFlLENBQUMsR0FBRyxFQUFHLENBQUMsT0FBTyxDQUFDO29CQUN6QyxNQUFNO2dCQUVQLEtBQUssbUNBQXFCLENBQUMsZ0JBQWdCO29CQUMxQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDaEQsTUFBTSxJQUFJLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNoQyxNQUFNLEdBQUcsR0FBSSxJQUFJLENBQUMsT0FBb0MsQ0FBQyxHQUFHLENBQUM7d0JBQzNELElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7NEJBQ3pFLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOzRCQUN2QixlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs0QkFDN0IsTUFBTTt5QkFDTjtxQkFDRDtvQkFFRCxNQUFNO2FBQ1A7WUFFRCxJQUFJLE9BQU8sRUFBRTtnQkFDWixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFFZDtpQkFBTTtnQkFDTixZQUFHLENBQUMsSUFBSSxDQUFDLDJCQUEyQixtQ0FBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM5RTtRQUNGLENBQUM7UUFJTyxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQTBCLEVBQUUsY0FBdUIsRUFBRSxRQUF5QjtZQUN6RyxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ2pDLEtBQUssTUFBTSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQ3RELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7d0JBQzNCLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7d0JBQ3JDLE1BQU07cUJBQ047aUJBQ0Q7YUFDRDtZQUVELElBQUksY0FBYyxLQUFLLFNBQVMsRUFBRTtnQkFDakMsTUFBTSxJQUFBLGFBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztnQkFFZixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBYyxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNwRTtZQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ2hFLGdCQUFnQixDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFFN0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3BELGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3BEO1lBRUQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBcUIsUUFBUSxDQUFDLEVBQUU7Z0JBQ2pFLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUVwRixJQUFJLFFBQVEsRUFBRTtvQkFDYixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztpQkFFdkQ7cUJBQU07b0JBQ04sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDN0M7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILGdCQUFnQixDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFFOUIsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVPLFVBQVUsQ0FBQyxJQUFXLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsUUFBcUI7WUFDckYsSUFBSSxRQUFRLEtBQUssc0JBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDdEQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDdEIsQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDbkIsQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDbkIsQ0FBQyxXQUFXLENBQUMsTUFBTTtvQkFDbkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNuRSxPQUFPLElBQUksQ0FBQztpQkFDWjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2dCQUNsRyxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdFLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO29CQUM3QixJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUMxQixPQUFPLElBQUksQ0FBQztxQkFDWjtpQkFDRDthQUNEO1lBRUQsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU8sVUFBVSxDQUFDLElBQVcsRUFBRSxLQUFhLEVBQUUsS0FBYSxFQUFFLEtBQWEsRUFBRSxRQUFxQixFQUFFLGtCQUF1QyxFQUFFLGNBQStCO1lBQzNLLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztZQUVoQixJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssMEJBQWEsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLElBQUksS0FBSywwQkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNwSixPQUFPLElBQUksR0FBRyxDQUFDO2FBQ2Y7WUFFRCxJQUFJLFFBQVEsS0FBSyxzQkFBVyxDQUFDLFlBQVksRUFBRTtnQkFDMUMsT0FBTyxJQUFJLEdBQUcsQ0FBQzthQUNmO1lBRUQsSUFBSSxjQUFjLEtBQUssU0FBUyxJQUFJLGNBQWMsS0FBSyxzQkFBYyxDQUFDLFFBQVEsSUFBSSxjQUFjLEtBQUssc0JBQWMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ2xJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEIsT0FBTyxJQUFJLENBQUMsQ0FBQztpQkFDYjtnQkFHRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsNkJBQXFCLEVBQUUsQ0FBQyxJQUFJLDZCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNyRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsNkJBQXFCLEVBQUUsQ0FBQyxJQUFJLDZCQUFxQixFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUNyRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO3dCQUMzRixJQUFJLEtBQUssRUFBRTs0QkFDVixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUM7NEJBQ3BFLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dDQUNwQyxPQUFPLElBQUksRUFBRSxDQUFDO2dDQUVkLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO29DQUN2QixPQUFPLElBQUksRUFBRSxDQUFDO2lDQUNkO2dDQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7b0NBQ3pDLE9BQU8sSUFBSSxFQUFFLENBQUM7aUNBQ2Q7Z0NBRUQsSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO29DQUN0QixPQUFPLElBQUksR0FBRyxDQUFDO2lDQUNmOzZCQUNEO3lCQUNEO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO29CQUM5RCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBRXZCLE9BQU8sSUFBSSxHQUFHLENBQUM7cUJBRWY7eUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFO3dCQUVwQyxPQUFPLElBQUksRUFBRSxDQUFDO3FCQUVkO3lCQUFNO3dCQUNOLE9BQU8sSUFBSSxDQUFDLENBQUM7cUJBQ2I7aUJBQ0Q7YUFDRDtZQUVELElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFO2dCQUU5QixPQUFPLElBQUksR0FBRyxDQUFDO2FBRWY7aUJBQU0sSUFBSSxrQkFBa0IsQ0FBQyxZQUFZLEVBQUU7Z0JBRTNDLE9BQU8sSUFBSSxDQUFDLENBQUM7YUFFYjtpQkFBTSxJQUFJLGtCQUFrQixDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBRXpELE9BQU8sSUFBSSxFQUFFLENBQUM7YUFDZDtZQUVELElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRTtnQkFFdEYsT0FBTyxJQUFJLEdBQUcsQ0FBQzthQUNmO1lBRUQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sYUFBYSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztZQUNwRCxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDekIsT0FBTzthQUNQO1lBRUQsbUJBQW1CLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDO0tBQ0Q7SUE1cUJELDZCQTRxQkMifQ==