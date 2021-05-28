"use strict";
var NavigationMessageType;
(function (NavigationMessageType) {
    NavigationMessageType[NavigationMessageType["UpdateAllTiles"] = 0] = "UpdateAllTiles";
    NavigationMessageType[NavigationMessageType["UpdateTile"] = 1] = "UpdateTile";
    NavigationMessageType[NavigationMessageType["GetTileLocations"] = 2] = "GetTileLocations";
})(NavigationMessageType || (NavigationMessageType = {}));
var WorldZ;
(function (WorldZ) {
    WorldZ[WorldZ["Min"] = 0] = "Min";
    WorldZ[WorldZ["Max"] = 1] = "Max";
    WorldZ[WorldZ["Cave"] = 0] = "Cave";
    WorldZ[WorldZ["Overworld"] = 1] = "Overworld";
})(WorldZ || (WorldZ = {}));
const freshWaterTileLocation = -1;
const anyWaterTileLocation = -2;
const gatherableTileLocation = -3;
let mapSize;
let mapSizeSq;
let freshWaterTypes;
let seaWaterTypes;
let gatherableTypes;
class Navigation {
    constructor() {
        this.navigationInfo = {};
        for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
            this.navigationInfo[z] = {
                tileLocations: {},
                kdTreeTileTypes: new Uint8Array(mapSizeSq),
            };
        }
    }
    processMessage(message) {
        let response;
        switch (message.type) {
            case NavigationMessageType.UpdateAllTiles:
                response = this.updateAllTiles(message);
                break;
            case NavigationMessageType.UpdateTile:
                this.updateTile(message);
                break;
            case NavigationMessageType.GetTileLocations:
                response = this.getTileLocations(message);
                break;
        }
        if (response) {
            self.postMessage(response);
        }
    }
    updateAllTiles(message) {
        const array = message.array;
        for (let z = WorldZ.Min; z <= WorldZ.Max; z++) {
            const navigationInfo = this.navigationInfo[z];
            if (!navigationInfo) {
                continue;
            }
            navigationInfo.tileLocations[freshWaterTileLocation] = new Module.KDTree();
            navigationInfo.tileLocations[anyWaterTileLocation] = new Module.KDTree();
            navigationInfo.tileLocations[gatherableTileLocation] = new Module.KDTree();
            for (let x = 0; x < mapSize; x++) {
                for (let y = 0; y < mapSize; y++) {
                    const index = (z * mapSizeSq * 3) + (y * mapSize * 3) + x * 3;
                    const isDisabled = array[index];
                    const penalty = array[index + 1];
                    const tileType = array[index + 2];
                    this._updateTile(x, y, z, isDisabled ? true : false, penalty, tileType, navigationInfo);
                }
            }
        }
        return {
            type: NavigationMessageType.UpdateAllTiles,
        };
    }
    updateTile(message) {
        this._updateTile(message.pos.x, message.pos.y, message.pos.z, message.disabled, message.penalty, message.tileType);
    }
    getTileLocations(message) {
        const navigationInfo = this.navigationInfo[message.pos.z];
        const start = performance.now();
        const tileLocationTree = navigationInfo.tileLocations[message.tileType];
        const result = tileLocationTree ? tileLocationTree.nearestPoints(message.pos.x, message.pos.y) : [];
        const time = performance.now() - start;
        return {
            type: NavigationMessageType.GetTileLocations,
            pos: message.pos,
            result: result,
            elapsedTime: time,
        };
    }
    _updateTile(x, y, z, disabled, penalty, tileType, navigationInfo = this.navigationInfo[z]) {
        if (!navigationInfo) {
            throw new Error("Invalid navigation info");
        }
        const kdTreeIndex = (y * mapSize) + x;
        let kdTreeTileType = navigationInfo.kdTreeTileTypes[kdTreeIndex];
        if (kdTreeTileType !== 0) {
            kdTreeTileType--;
            if (kdTreeTileType === tileType) {
                return;
            }
            navigationInfo.tileLocations[kdTreeTileType].deletePoint(x, y);
            this.updateSpecialTileTypes(navigationInfo, kdTreeTileType, x, y, false);
        }
        navigationInfo.kdTreeTileTypes[kdTreeIndex] = tileType + 1;
        if (!navigationInfo.tileLocations[tileType]) {
            navigationInfo.tileLocations[tileType] = new Module.KDTree();
        }
        navigationInfo.tileLocations[tileType].insertPoint(x, y);
        this.updateSpecialTileTypes(navigationInfo, tileType, x, y, true);
    }
    updateSpecialTileTypes(navigationInfo, tileType, x, y, insert) {
        const isFreshWater = freshWaterTypes.has(tileType);
        const isSeawater = seaWaterTypes.has(tileType);
        if (isFreshWater || isSeawater) {
            if (insert) {
                navigationInfo.tileLocations[anyWaterTileLocation].insertPoint(x, y);
            }
            else {
                navigationInfo.tileLocations[anyWaterTileLocation].deletePoint(x, y);
            }
            if (isFreshWater) {
                if (insert) {
                    navigationInfo.tileLocations[freshWaterTileLocation].insertPoint(x, y);
                }
                else {
                    navigationInfo.tileLocations[freshWaterTileLocation].deletePoint(x, y);
                }
            }
        }
        if (gatherableTypes.has(tileType)) {
            if (insert) {
                navigationInfo.tileLocations[gatherableTileLocation].insertPoint(x, y);
            }
            else {
                navigationInfo.tileLocations[gatherableTileLocation].deletePoint(x, y);
            }
        }
    }
}
const webWorkerSelf = self;
let queuedMessages;
function WaywardPlusPlusLoaded() {
    const navigation = new Navigation();
    if (queuedMessages) {
        for (const message of queuedMessages) {
            navigation.processMessage(message);
        }
        queuedMessages = undefined;
    }
    webWorkerSelf.onmessage = (event) => {
        navigation.processMessage(event.data);
    };
}
webWorkerSelf.onmessage = (event) => {
    const data = event.data;
    if (queuedMessages) {
        queuedMessages.push(data);
        return;
    }
    console.log("Navigation worker initial data", data);
    queuedMessages = [];
    let pathPrefix = data.pathPrefix;
    if (pathPrefix.endsWith("\\")) {
        pathPrefix = pathPrefix.substring(0, pathPrefix.length - 1);
    }
    mapSize = data.mapSize;
    mapSizeSq = data.mapSizeSq;
    freshWaterTypes = new Set(data.freshWaterTypes);
    seaWaterTypes = new Set(data.seaWaterTypes);
    gatherableTypes = new Set(data.gatherableTypes);
    const oldFetch = fetch;
    self.fetch = async (input, init) => {
        input = `${pathPrefix}\\static\\js\\wayward.wasm`;
        return oldFetch(input, init);
    };
    importScripts(`${pathPrefix}\\static\\js\\wayward.js`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9uYXZpZ2F0aW9uL05hdmlnYXRpb25Xb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWNBLElBQUsscUJBSUo7QUFKRCxXQUFLLHFCQUFxQjtJQUN6QixxRkFBYyxDQUFBO0lBQ2QsNkVBQVUsQ0FBQTtJQUNWLHlGQUFnQixDQUFBO0FBQ2pCLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0FBMENELElBQUssTUFLSjtBQUxELFdBQUssTUFBTTtJQUNWLGlDQUFPLENBQUE7SUFDUCxpQ0FBTyxDQUFBO0lBQ1AsbUNBQVEsQ0FBQTtJQUNSLDZDQUFhLENBQUE7QUFDZCxDQUFDLEVBTEksTUFBTSxLQUFOLE1BQU0sUUFLVjtBQUlELE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQyxNQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBRWxDLElBQUksT0FBZSxDQUFDO0FBQ3BCLElBQUksU0FBaUIsQ0FBQztBQUV0QixJQUFJLGVBQWlDLENBQUM7QUFDdEMsSUFBSSxhQUErQixDQUFDO0FBQ3BDLElBQUksZUFBaUMsQ0FBQztBQVN0QyxNQUFNLFVBQVU7SUFJZjtRQUZpQixtQkFBYyxHQUF5QyxFQUFFLENBQUM7UUFHMUUsS0FBSyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0JBQ3hCLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixlQUFlLEVBQUUsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDO2FBQzFDLENBQUM7U0FDRjtJQUNGLENBQUM7SUFFTSxjQUFjLENBQUMs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