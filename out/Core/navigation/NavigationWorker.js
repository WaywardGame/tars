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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25hdmlnYXRpb24vTmF2aWdhdGlvbldvcmtlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBY0EsSUFBSyxxQkFJSjtBQUpELFdBQUsscUJBQXFCO0lBQ3pCLHFGQUFjLENBQUE7SUFDZCw2RUFBVSxDQUFBO0lBQ1YseUZBQWdCLENBQUE7QUFDakIsQ0FBQyxFQUpJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFJekI7QUEwQ0QsSUFBSyxNQUtKO0FBTEQsV0FBSyxNQUFNO0lBQ1YsaUNBQU8sQ0FBQTtJQUNQLGlDQUFPLENBQUE7SUFDUCxtQ0FBUSxDQUFBO0lBQ1IsNkNBQWEsQ0FBQTtBQUNkLENBQUMsRUFMSSxNQUFNLEtBQU4sTUFBTSxRQUtWO0FBSUQsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFbEMsSUFBSSxPQUFlLENBQUM7QUFDcEIsSUFBSSxTQUFpQixDQUFDO0FBRXRCLElBQUksZUFBaUMsQ0FBQztBQUN0QyxJQUFJLGFBQStCLENBQUM7QUFDcEMsSUFBSSxlQUFpQyxDQUFDO0FBU3RDLE1BQU0sVUFBVTtJQUlmO1FBRmlCLG1CQUFjLEdBQXlDLEVBQUUsQ0FBQztRQUcxRSxLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDeEIsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUM7YUFDMUMsQ0FBQztTQUNGO0lBQ0YsQ0FBQztJQUVNLGNB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