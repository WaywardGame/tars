var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "tile/ITileEvent", "tile/Terrains", "utilities/promise/ResolvablePromise", "utilities/TileHelpers", "./Helpers", "./INavigation", "./Utilities/Logger", "creature/Pathing", "utilities/math/Vector2"], function (require, exports, Enums_1, ITileEvent_1, Terrains_1, ResolvablePromise_1, TileHelpers_1, Helpers, INavigation_1, Logger_1, Pathing_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.seawaterTileLocation = -1;
    exports.freshWaterTileLocation = -2;
    exports.anyWaterTileLocation = -3;
    class Navigation {
        constructor() {
            const modPath = Helpers.getPath();
            let pathPrefix;
            try {
                pathPrefix = steamworks.getAppPath();
            }
            catch (ex) {
                const slashesCount = (modPath.match(/\//g) || []).length;
                pathPrefix = "../../";
                for (let i = 0; i < slashesCount; i++) {
                    pathPrefix += "../";
                }
            }
            this.navigationWorker = new Worker(`${modPath}/out/NavigationWorker.js`);
            this.navigationWorker.postMessage(pathPrefix);
        }
        delete() {
            this.navigationWorker.terminate();
        }
        updateAll() {
            Logger_1.log("Updating navigation. Please wait...");
            const zs = 2;
            const array = new Uint8Array(game.mapSize * game.mapSize * zs * 3);
            const start = performance.now();
            for (let z = Enums_1.WorldZ.Min; z <= Enums_1.WorldZ.Max; z++) {
                for (let x = 0; x < game.mapSize; x++) {
                    for (let y = 0; y < game.mapSize; y++) {
                        const tile = game.getTile(x, y, z);
                        this.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, z, array);
                    }
                }
            }
            const updateAllTilesMessage = {
                type: INavigation_1.NavigationMessageType.UpdateAllTiles,
                array: array
            };
            this.navigationWorker.postMessage(updateAllTilesMessage, [array.buffer]);
            return new Promise((resolve) => {
                this.navigationWorker.onmessage = (event) => {
                    const time = performance.now() - start;
                    Logger_1.log(`Updated navigation in ${time}ms`);
                    resolve();
                };
            });
        }
        onTileUpdate(tile, tileType, x, y, z, array) {
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const isDisabled = this.isDisabled(tile, x, y, z, tileType, terrainDescription);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription);
            if (array) {
                const index = (z * game.mapSize * game.mapSize * 3) + (y * game.mapSize * 3) + x * 3;
                array[index] = isDisabled ? 1 : 0;
                array[index + 1] = penalty;
                array[index + 2] = tileType;
            }
            else {
                const updateTileMessage = {
                    type: INavigation_1.NavigationMessageType.UpdateTile,
                    x: x,
                    y: y,
                    z: z,
                    disabled: isDisabled,
                    penalty: penalty,
                    tileType: tileType
                };
                this.navigationWorker.postMessage(updateTileMessage);
            }
        }
        getNearestTileLocation(tileType, point) {
            return __awaiter(this, void 0, void 0, function* () {
                const getTileLocationsMessage = {
                    type: INavigation_1.NavigationMessageType.GetTileLocations,
                    tileType: tileType,
                    x: point.x,
                    y: point.y,
                    z: point.z
                };
                const promise2 = new ResolvablePromise_1.default();
                this.navigationWorker.onmessage = (event) => {
                    const tileLocations = event.data;
                    promise2.resolve(tileLocations.map(p => {
                        const nearestPoint = Object.assign({}, p, { z: point.z });
                        return {
                            type: tileType,
                            point: nearestPoint,
                            tile: game.getTileFromPoint(nearestPoint)
                        };
                    }));
                };
                this.navigationWorker.postMessage(getTileLocationsMessage);
                return promise2;
            });
        }
        getValidPoints(point, includePoint) {
            if (includePoint && !this.isDisabledFromPoint(point)) {
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
        findPath(start, end) {
            return __awaiter(this, void 0, void 0, function* () {
                const now = performance.now();
                const findPathMessage = {
                    type: INavigation_1.NavigationMessageType.FindPath,
                    startX: start.x,
                    startY: start.y,
                    endX: end.x,
                    endY: end.y,
                    z: start.z
                };
                const promise2 = new ResolvablePromise_1.default();
                this.navigationWorker.onmessage = (event) => {
                    const time = performance.now() - now;
                    Logger_1.log(`Find path time: ${time.toFixed(2)}ms`);
                    const path = event.data;
                    if (path) {
                        const pathPoints = path.map(node => ({
                            x: node.x,
                            y: node.y,
                            z: start.z
                        }));
                        Logger_1.log(`Total length: ${pathPoints.length}. Distance from current position: ${Math.round(Vector2_1.default.distance(localPlayer, pathPoints[pathPoints.length - 1]))}`);
                        promise2.resolve(pathPoints);
                    }
                    else {
                        promise2.resolve(undefined);
                    }
                };
                this.navigationWorker.postMessage(findPathMessage);
                return promise2;
            });
        }
        isDisabledFromPoint(point) {
            const tile = game.getTileFromPoint(point);
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return false;
            }
            return this.isDisabled(tile, point.x, point.y, point.z, tileType, terrainDescription);
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
        isDisabled(tile, x, y, z, tileType, terrainDescription) {
            return Pathing_1.isWalkToTileBlocked(localPlayer, tile, { x, y }, false);
        }
        getPenalty(tile, x, y, z, tileType, terrainDescription) {
            let penalty = 0;
            const terrainType = TileHelpers_1.default.getType(tile);
            if (terrainType === Enums_1.TerrainType.Lava || tileEventManager.get(tile, ITileEvent_1.TileEventType.Fire)) {
                penalty += 12;
            }
            if (tile.doodad !== undefined && tile.doodad.type !== Enums_1.DoodadType.WoodenDoor && tile.doodad.type !== Enums_1.DoodadType.WoodenDoorOpen) {
                if (tile.doodad.blocksMove()) {
                    penalty += 12;
                }
                else {
                    penalty += 4;
                }
            }
            if (terrainDescription.gather) {
                penalty += 16;
            }
            if (terrainDescription.shallowWater) {
                penalty += 6;
            }
            else if (terrainDescription.water) {
                penalty += 20;
            }
            return penalty;
        }
    }
    exports.Navigation = Navigation;
    let instance;
    function getNavigation() {
        if (!instance) {
            instance = new Navigation();
        }
        return instance;
    }
    exports.getNavigation = getNavigation;
    function deleteNavigation() {
        if (instance) {
            instance.delete();
            instance = undefined;
        }
    }
    exports.deleteNavigation = deleteNavigation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBY2EsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixRQUFBLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVCLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFdkMsTUFBYSxVQUFVO1FBSXRCO1lBQ0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWxDLElBQUksVUFBa0IsQ0FBQztZQUN2QixJQUFJO2dCQUNILFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckM7WUFBQyxPQUFPLEVBQUUsRUFBRTtnQkFDWixNQUFNLFlBQVksR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUV6RCxVQUFVLEdBQUcsUUFBUSxDQUFDO2dCQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxVQUFVLElBQUksS0FBSyxDQUFDO2lCQUNwQjthQUNEO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsT0FBTywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLE1BQU07WUFDWixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLFNBQVM7WUFDZixZQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUUzQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFYixN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