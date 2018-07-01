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
        getValidPoint(point, includePoint) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBYWEsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMxQixRQUFBLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzVCLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFdkM7UUFJQztZQUNDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUVsQyxJQUFJLFVBQWtCLENBQUM7WUFDdkIsSUFBSTtnQkFDSCxVQUFVLEdBQUcsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3JDO1lBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ1osTUFBTSxZQUFZLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztnQkFFekQsVUFBVSxHQUFHLFFBQVEsQ0FBQztnQkFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDdEMsVUFBVSxJQUFJLEtBQUssQ0FBQztpQkFDcEI7YUFDRDtZQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLE9BQU8sMEJBQTBCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxNQUFNO1lBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ25DLENBQUM7UUFFTSxTQUFTO1lBQ2YsWUFBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFFM0MsTUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTlELE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3RDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2xELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsY0FBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDbEY7YUFDRDtZQUVELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFFdkMsWUFBRyxDQUFDLHlCQUF5QixJQUFJLElBQUksQ0FBQyxDQUFDO1lBRXZDLE1BQU0scUJBQXFCLEdBQTJCO2dCQUNyRCxJQUFJLEVBQUUsbUNBQXFCLENBQUMsY0FBYztnQkFDMUMsS0FBSyxFQUFFLEtBQUs7YUFDWixDQUFDO1lBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXpFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBNEIxQixDQUFDO1FBRU0sWUFBWSxDQUFDLElBQVcsRUFBRSxRQUFxQixFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQWtCO1lBQzFHLElBQUksQ0FBQyxLQUFLLGNBQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQzNCLE9BQU87YUFDUDtZQUVELE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUDtZQUVELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ2hGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBRTdFLElBQUksS0FBSyxFQUFFO2dCQUNWLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDN0MsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUMzQixLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQzthQUU1QjtpQkFBTTtnQkFDTixNQUFNLGlCQUFpQixHQUF1QjtvQkFDN0MsSUFBSSxFQUFFLG1DQUFxQixDQUFDLFVBQVU7b0JBQ3RDLENBQUMsRUFBRSxDQUFDO29CQUNKLENBQUMsRUFBRSxDQUFDO29CQUNKLFFBQVEsRUFBRSxVQUFVO29CQUNwQixPQUFPLEVBQUUsT0FBTztvQkFDaEIsUUFBUSxFQUFFLFFBQVE7aUJBQ2xCLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3JEO1FBQ0YsQ0FBQztRQUVZLHNCQUFzQixDQUFDLFFBQXFCLEVBQUUsS0FBZTs7Z0JBR3pFLE1BQU0sdUJBQXVCLEdBQTZCO29CQUN6RCxJQUFJLEVBQUUsbUNBQXFCLENBQUMsZ0JBQWdCO29CQUM1QyxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNWLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDVixDQUFDO2dCQUVGLE1BQU0sUUFBUSxHQUFHLElBQUksMkJBQVEsRUFBbUIsQ0FBQztnQkFFakQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQW1CLEVBQUUsRUFBRTtvQkFJekQsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQWtCLENBQUM7b0JBRS9DLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEMsTUFBTSxZQUFZLHFCQUNkLENBQUMsSUFDSixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FDVixDQUFDO3dCQUVGLE9BQU87NEJBQ04sSUFBSSxFQUFFLFFBQVE7NEJBQ2QsS0FBSyxFQUFFLFlBQVk7NEJBQ25CLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDO3lCQUN6QyxDQUFDO29CQUNILENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDO2dCQUVGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFFM0QsT0FBTyxRQUFRLENBQUM7WUFDakIsQ0FBQztTQUFBO1FBRU0sYUFBYSxDQUFDLEtBQWUsRUFBRSxZQUFxQjtZQUMxRCxJQUFJLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2Y7WUFHRCxNQUFNLE1BQU0sR0FBZSxFQUFFLENBQUM7WUFFOUIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxRCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsUUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN0QjtZQUVELFFBQVEsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdEI7WUFFRCxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFO29CQUMxQixPQUFPLENBQUMsQ0FBQztpQkFDVDtnQkFFRCxPQUFPLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRVksUUFBUSxDQUFDLEtBQWUsRUFBRSxHQUFhOztnQkFDbkQsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUU5QixNQUFNLGVBQWUsR0FBcUI7b0JBQ3pDLElBQUksRUFBRSxtQ0FBcUIsQ0FBQyxRQUFRO29CQUNwQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2YsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNmLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDWCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7aUJBQ1gsQ0FBQztnQkFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLDJCQUFRLEVBQTBCLENBQUM7Z0JBRXhELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxLQUFtQixFQUFFLEVBQUU7b0JBQ3pELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7b0JBQ3JDLFlBQUcsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTVDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFnQyxDQUFDO29CQUNwRCxJQUFJLElBQUksRUFBRTt3QkFHVCxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOzRCQUM1QyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQ1QsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUNULENBQUMsRUFBRSxjQUFNLENBQUMsU0FBUzt5QkFDbkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFFTDt5QkFBTTt3QkFDTixRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUM1QjtnQkFDRixDQUFDLENBQUM7Z0JBRUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFbkQsT0FBTyxRQUFRLENBQUM7WUFDakIsQ0FBQztTQUFBO1FBRU8sbUJBQW1CLENBQUMsS0FBZTtZQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUMsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVPLG1CQUFtQixDQUFDLEtBQWU7WUFDMUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFDLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFTyxVQUFVLENBQUMsSUFBVyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLFFBQXFCLEVBQUUsa0JBQXVDO1lBQzlILE9BQU8sNkJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sVUFBVSxDQUFDLElBQVcsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxRQUFxQixFQUFFLGtCQUF1QztZQUM5SCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFFaEIsTUFBTSxXQUFXLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxXQUFXLEtBQUssbUJBQVcsQ0FBQyxJQUFJLElBQUksZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSwwQkFBYSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN2RixPQUFPLElBQUksRUFBRSxDQUFDO2FBQ2Q7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGtCQUFVLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGtCQUFVLENBQUMsY0FBYyxFQUFFO2dCQUM5SCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUU7b0JBRTdCLE9BQU8sSUFBSSxFQUFFLENBQUM7aUJBRWQ7cUJBQU07b0JBQ04sT0FBTyxJQUFJLENBQUMsQ0FBQztpQkFDYjthQUNEO1lBRUQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBRTlCLE9BQU8sSUFBSSxFQUFFLENBQUM7YUFDZDtZQUdELElBQUksa0JBQWtCLENBQUMsWUFBWSxFQUFFO2dCQUNwQyxPQUFPLElBQUksQ0FBQyxDQUFDO2FBRWI7aUJBQU0sSUFBSSxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3BDLE9BQU8sSUFBSSxFQUFFLENBQUM7YUFDZDtZQUVELE9BQU8sT0FBTyxDQUFDO1FBQ2hCLENBQUM7S0FDRDtJQS9SRCxnQ0ErUkM7SUFFRCxJQUFJLFFBQWdDLENBQUM7SUFFckM7UUFDQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2QsUUFBUSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7U0FDNUI7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNqQixDQUFDO0lBTkQsc0NBTUM7SUFFRDtRQUNDLElBQUksUUFBUSxFQUFFO1lBQ2IsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xCLFFBQVEsR0FBRyxTQUFTLENBQUM7U0FDckI7SUFDRixDQUFDO0lBTEQsNENBS0MifQ==