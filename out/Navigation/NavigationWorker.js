"use strict";
var NavigationMessageType;
(function (NavigationMessageType) {
    NavigationMessageType[NavigationMessageType["UpdateAllTiles"] = 0] = "UpdateAllTiles";
    NavigationMessageType[NavigationMessageType["UpdateTile"] = 1] = "UpdateTile";
    NavigationMessageType[NavigationMessageType["GetTileLocations"] = 2] = "GetTileLocations";
})(NavigationMessageType || (NavigationMessageType = {}));
var TerrainType;
(function (TerrainType) {
    TerrainType[TerrainType["DeepSeawater"] = 0] = "DeepSeawater";
    TerrainType[TerrainType["Seawater"] = 1] = "Seawater";
    TerrainType[TerrainType["ShallowSeawater"] = 2] = "ShallowSeawater";
    TerrainType[TerrainType["DeepFreshWater"] = 3] = "DeepFreshWater";
    TerrainType[TerrainType["FreshWater"] = 4] = "FreshWater";
    TerrainType[TerrainType["ShallowFreshWater"] = 5] = "ShallowFreshWater";
})(TerrainType || (TerrainType = {}));
const freshWaterTileLocation = -1;
const anyWaterTileLocation = -2;
let mapSize;
let mapSizeSq;
class Navigation {
    constructor() {
        this.navigationInfo = {};
        for (let z = 0; z <= 1; z++) {
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
        for (let z = 0; z <= 1; z++) {
            const navigationInfo = this.navigationInfo[z];
            if (!navigationInfo) {
                continue;
            }
            navigationInfo.tileLocations[freshWaterTileLocation] = new Module.KDTree();
            navigationInfo.tileLocations[anyWaterTileLocation] = new Module.KDTree();
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
            this.updateWaterTiles(navigationInfo, kdTreeTileType, x, y, false);
        }
        navigationInfo.kdTreeTileTypes[kdTreeIndex] = tileType + 1;
        if (!navigationInfo.tileLocations[tileType]) {
            navigationInfo.tileLocations[tileType] = new Module.KDTree();
        }
        navigationInfo.tileLocations[tileType].insertPoint(x, y);
        this.updateWaterTiles(navigationInfo, tileType, x, y, true);
    }
    updateWaterTiles(navigationInfo, tileType, x, y, insert) {
        const isFreshWater = tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater;
        const isSeawater = tileType === TerrainType.ShallowSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater;
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
    if (queuedMessages) {
        queuedMessages.push(event.data);
        return;
    }
    queuedMessages = [];
    const pathPrefix = event.data.pathPrefix;
    mapSize = event.data.mapSize;
    mapSizeSq = event.data.mapSizeSq;
    const oldFetch = fetch;
    self.fetch = async (input, init) => {
        input = `${pathPrefix}\\static\\js\\wayward.wasm`;
        return oldFetch(input, init);
    };
    importScripts(`${pathPrefix}\\static\\js\\wayward.js`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9OYXZpZ2F0aW9uL05hdmlnYXRpb25Xb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWFBLElBQUsscUJBSUo7QUFKRCxXQUFLLHFCQUFxQjtJQUN6QixxRkFBYyxDQUFBO0lBQ2QsNkVBQVUsQ0FBQTtJQUNWLHlGQUFnQixDQUFBO0FBQ2pCLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0FBMENELElBQUssV0FPSjtBQVBELFdBQUssV0FBVztJQUNmLDZEQUFnQixDQUFBO0lBQ2hCLHFEQUFZLENBQUE7SUFDWixtRUFBbUIsQ0FBQTtJQUNuQixpRUFBa0IsQ0FBQTtJQUNsQix5REFBYyxDQUFBO0lBQ2QsdUVBQXFCLENBQUE7QUFDdEIsQ0FBQyxFQVBJLFdBQVcsS0FBWCxXQUFXLFFBT2Y7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFaEMsSUFBSSxPQUFlLENBQUM7QUFDcEIsSUFBSSxTQUFpQixDQUFDO0FBU3RCLE1BQU0sVUFBVTtJQUlmO1FBRmlCLG1CQUFjLEdBQXlDLEVBQUUsQ0FBQztRQUcxRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0JBQ3hCLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixlQUFlLEVBQUUsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDO2FBQzFDLENBQUM7U0FDRjtJQUNGLENBQUM7SUFFTSxjQUFjLENBQUMsT0FBMEI7UUFDL0MsSUFBSSxRQUFhLENBQUM7UUFFbEIsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ3JCLEtBQUsscUJBQXFCLENBQUMsY0FB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