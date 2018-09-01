var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "Enums", "tile/ITileEvent", "tile/Terrains", "utilities/promise/ResolvablePromise", "utilities/TileHelpers", "./Helpers", "./INavigation", "./Utilities/Logger", "creature/Pathing"], function (require, exports, Enums_1, ITileEvent_1, Terrains_1, ResolvablePromise_1, TileHelpers_1, Helpers, INavigation_1, Logger_1, Pathing_1) {
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
            const array = new Uint8Array(game.mapSize * game.mapSize * 3);
            const start = performance.now();
            for (let x = 0; x < game.mapSize; x++) {
                for (let y = 0; y < game.mapSize; y++) {
                    const tile = game.getTile(x, y, Enums_1.WorldZ.Overworld);
                    this.onTileUpdate(tile, TileHelpers_1.default.getType(tile), x, y, Enums_1.WorldZ.Overworld, array);
                }
            }
            const time = performance.now() - start;
            Logger_1.log(`Updated navigation in ${time}ms`);
            const updateAllTilesMessage = {
                type: INavigation_1.NavigationMessageType.UpdateAllTiles,
                array: array
            };
            this.navigationWorker.postMessage(updateAllTilesMessage, [array.buffer]);
            return Promise.resolve();
        }
        onTileUpdate(tile, tileType, x, y, z, array) {
            if (z !== Enums_1.WorldZ.Overworld) {
                return;
            }
            const terrainDescription = Terrains_1.default[tileType];
            if (!terrainDescription) {
                return;
            }
            const isDisabled = this.isDisabled(tile, x, y, z, tileType, terrainDescription);
            const penalty = this.getPenalty(tile, x, y, z, tileType, terrainDescription);
            if (array) {
                const index = (y * game.mapSize * 3) + x * 3;
                array[index] = isDisabled ? 1 : 0;
                array[index + 1] = penalty;
                array[index + 2] = tileType;
            }
            else {
                const updateTileMessage = {
                    type: INavigation_1.NavigationMessageType.UpdateTile,
                    x: x,
                    y: y,
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
                    y: point.y
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
                    endY: end.y
                };
                const promise2 = new ResolvablePromise_1.default();
                this.navigationWorker.onmessage = (event) => {
                    const time = performance.now() - now;
                    Logger_1.log(`Find path time: ${time.toFixed(2)}ms`);
                    const path = event.data;
                    if (path) {
                        promise2.resolve(path.map(node => ({
                            x: node.x,
                            y: node.y,
                            z: Enums_1.WorldZ.Overworld
                        })));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBYWEsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixRQUFBLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVCLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFdkMsTUFBYSxVQUFVO1FBSXRCO1lBQ0MsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWxDLElBQUksVUFBa0IsQ0FBQztZQUN2QixJQUFJO2dCQUNILFVBQVUsR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckM7WUFBQyxPQUFPLEVBQUUsRUFBRTtnQkFDWixNQUFNLFlBQVksR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUV6RCxVQUFVLEdBQUcsUUFBUSxDQUFDO2dCQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUN0QyxVQUFVLElBQUksS0FBSyxDQUFDO2lCQUNwQjthQUNEO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsT0FBTywwQkFBMEIsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLE1BQU07WUFDWixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVNLFNBQVM7WUFDZixZQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUUzQyxNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxJ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