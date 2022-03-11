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
        const start = performance.now();
        const result = this.navigationInfo[message.pos.z].tileLocations[message.tileType]?.nearestPoints(message.pos.x, message.pos.y) ?? [];
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
    console.log("[TARS] Navigation worker initial data", data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbldvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBY0EsSUFBSyxxQkFJSjtBQUpELFdBQUsscUJBQXFCO0lBQ3pCLHFGQUFjLENBQUE7SUFDZCw2RUFBVSxDQUFBO0lBQ1YseUZBQWdCLENBQUE7QUFDakIsQ0FBQyxFQUpJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFJekI7QUEwQ0QsSUFBSyxNQUtKO0FBTEQsV0FBSyxNQUFNO0lBQ1YsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxtQ0FBUSxDQUFBO0lBQ1IsNkNBQWEsQ0FBQTtBQUNkLENBQUMsRUFMSSxNQUFNLEtBQU4sTUFBTSxRQUtWO0FBSUQsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbEMsSUFBSSxPQUFlLENBQUM7QUFDcEIsSUFBSSxTQUFpQixDQUFDO0FBRXRCLElBQUksZUFBaUMsQ0FBQztBQUN0QyxJQUFJLGFBQStCLENBQUM7QUFDcEMsSUFBSSxlQUFpQyxDQUFDO0FBU3RDLE1BQU0sVUFBVTtJQUlmO1FBRmlCLG1CQUFjLEdBQW9DLEVBQUUsQ0FBQztRQUdyRSxLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDeEIsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUM7YUFDMUMsQ0FBQztTQUNGO0lBQ0YsQ0FBQztJQUVNLGNB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