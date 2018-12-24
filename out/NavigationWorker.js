"use strict";
var NavigationMessageType;
(function (NavigationMessageType) {
    NavigationMessageType[NavigationMessageType["UpdateAllTiles"] = 0] = "UpdateAllTiles";
    NavigationMessageType[NavigationMessageType["UpdateTile"] = 1] = "UpdateTile";
    NavigationMessageType[NavigationMessageType["FindPath"] = 2] = "FindPath";
    NavigationMessageType[NavigationMessageType["GetTileLocations"] = 3] = "GetTileLocations";
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
const seawaterTileLocation = -1;
const freshWaterTileLocation = -2;
const anyWaterTileLocation = -3;
class NavigationInfo {
}
class Navigation {
    constructor() {
        this.navigationInfo = {};
        for (let z = 0; z <= 1; z++) {
            this.navigationInfo[z] = {
                navigationInstance: new Module.Navigation(true),
                tileLocations: {},
                kdTreeTileTypes: new Uint8Array(512 * 512)
            };
        }
    }
    processMessage(message) {
        switch (message.type) {
            case NavigationMessageType.UpdateAllTiles:
                this.updateAllTiles(message);
                break;
            case NavigationMessageType.UpdateTile:
                this.updateTile(message);
                break;
            case NavigationMessageType.FindPath:
                this.findPath(message);
                break;
            case NavigationMessageType.GetTileLocations:
                this.getTileLocations(message);
                break;
        }
    }
    updateAllTiles(message) {
        const array = message.array;
        for (let z = 0; z <= 1; z++) {
            const navigationInfo = this.navigationInfo[z];
            if (!navigationInfo) {
                continue;
            }
            navigationInfo.tileLocations[seawaterTileLocation] = new Module.KDTree();
            navigationInfo.tileLocations[freshWaterTileLocation] = new Module.KDTree();
            navigationInfo.tileLocations[anyWaterTileLocation] = new Module.KDTree();
            for (let x = 0; x < 512; x++) {
                for (let y = 0; y < 512; y++) {
                    const index = (z * 512 * 512 * 3) + (y * 512 * 3) + x * 3;
                    const isDisabled = array[index];
                    const penalty = array[index + 1];
                    const tileType = array[index + 2];
                    this._updateTile(x, y, z, isDisabled ? true : false, penalty, tileType, navigationInfo);
                }
            }
        }
        self.postMessage(undefined);
    }
    updateTile(message) {
        this._updateTile(message.x, message.y, message.z, message.disabled, message.penalty, message.tileType);
    }
    findPath(message) {
        const navigationInfo = this.navigationInfo[message.z];
        const startNode = navigationInfo.navigationInstance.getNode(message.startX, message.startY);
        const endNode = navigationInfo.navigationInstance.getNode(message.endX, message.endY);
        const path = navigationInfo.navigationInstance.findPath(startNode, endNode);
        if (path) {
            self.postMessage(path.map(node => ({ x: node.x, y: node.y })));
        }
        else {
            self.postMessage(undefined);
        }
    }
    getTileLocations(message) {
        const navigationInfo = this.navigationInfo[message.z];
        const tileLocationTree = navigationInfo.tileLocations[message.tileType];
        self.postMessage(tileLocationTree ? tileLocationTree.nearestPoint(message.x, message.y) : []);
    }
    _updateTile(x, y, z, disabled, penalty, tileType, navigationInfo = this.navigationInfo[z]) {
        const node = navigationInfo.navigationInstance.getNode(x, y);
        node.disabled = disabled;
        node.penalty = penalty;
        const kdTreeIndex = (y * 512) + x;
        let kdTreeTileType = navigationInfo.kdTreeTileTypes[kdTreeIndex];
        let waterIndex;
        if (kdTreeTileType !== 0) {
            kdTreeTileType--;
            if (kdTreeTileType === tileType) {
                return;
            }
            navigationInfo.tileLocations[kdTreeTileType].deletePoint(x, y);
            waterIndex = Navigation.getTileLocationWaterIndex(kdTreeTileType);
            if (waterIndex !== undefined) {
                navigationInfo.tileLocations[waterIndex].deletePoint(x, y);
                navigationInfo.tileLocations[anyWaterTileLocation].deletePoint(x, y);
            }
        }
        navigationInfo.kdTreeTileTypes[kdTreeIndex] = tileType + 1;
        if (!navigationInfo.tileLocations[tileType]) {
            navigationInfo.tileLocations[tileType] = new Module.KDTree();
        }
        navigationInfo.tileLocations[tileType].insertPoint(x, y);
        waterIndex = Navigation.getTileLocationWaterIndex(tileType);
        if (waterIndex !== undefined) {
            navigationInfo.tileLocations[waterIndex].insertPoint(x, y);
            navigationInfo.tileLocations[anyWaterTileLocation].insertPoint(x, y);
        }
    }
    static getTileLocationWaterIndex(tileType) {
        if (tileType === TerrainType.ShallowSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater) {
            return seawaterTileLocation;
        }
        else if (tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater) {
            return freshWaterTileLocation;
        }
        return undefined;
    }
}
const webWorkerSelf = self;
let queuedMessages;
function WaywardPlusPlusLoaded() {
    console.log("[TARS] Navigation Worker WaywardPlusPlusLoaded");
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
    else {
        queuedMessages = [];
    }
    const pathPrefix = event.data;
    const oldFetch = fetch;
    self.fetch = (input, init) => {
        input = `${pathPrefix}/${input}`;
        return oldFetch(input, init);
    };
    importScripts(`${pathPrefix}/static/js/wayward.js`);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxJQUFLLHFCQUtKO0FBTEQsV0FBSyxxQkFBcUI7SUFDekIscUZBQWMsQ0FBQTtJQUNkLDZFQUFVLENBQUE7SUFDVix5RUFBUSxDQUFBO0lBQ1IseUZBQWdCLENBQUE7QUFDakIsQ0FBQyxFQUxJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFLekI7QUF3Q0QsSUFBSyxXQU9KO0FBUEQsV0FBSyxXQUFXO0lBQ2YsNkRBQWdCLENBQUE7SUFDaEIscURBQVksQ0FBQTtJQUNaLG1FQUFtQixDQUFBO0lBQ25CLGlFQUFrQixDQUFBO0lBQ2xCLHlEQUFjLENBQUE7SUFDZCx1RUFBcUIsQ0FBQTtBQUN0QixDQUFDLEVBUEksV0FBVyxLQUFYLFdBQVcsUUFPZjtBQUVELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBSWhDLE1BQU0sY0FBYztDQUluQjtBQUVELE1BQU0sVUFBVTtJQUlmO1FBRmlCLG1CQUFjLEdBQXdDLEVBQUUsQ0FBQztRQUd6RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUc7Z0JBQ3hCLGtCQUFrQixFQUFFLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLGFBQWEsRUFBRSxFQUFFO2dCQUNqQixlQUFlLEVBQUUsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQzthQUMxQyxDQUFDO1NBQ0Y7SUFDRixDQUFDO0lBRU0sY0FBYyxDQUFDLE9B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