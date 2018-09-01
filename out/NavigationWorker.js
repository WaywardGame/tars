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
class Navigation {
    constructor() {
        this.navigationInstance = new Module.Navigation(true);
        this.tileLocations = {};
        this.kdTreeTileTypes = new Uint8Array(512 * 512);
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
        this.tileLocations[seawaterTileLocation] = new Module.KDTree();
        this.tileLocations[freshWaterTileLocation] = new Module.KDTree();
        this.tileLocations[anyWaterTileLocation] = new Module.KDTree();
        const array = message.array;
        for (let x = 0; x < 512; x++) {
            for (let y = 0; y < 512; y++) {
                const index = (y * 512 * 3) + x * 3;
                const isDisabled = array[index];
                const penalty = array[index + 1];
                const tileType = array[index + 2];
                this._updateTile(x, y, isDisabled ? true : false, penalty, tileType);
            }
        }
    }
    updateTile(message) {
        this._updateTile(message.x, message.y, message.disabled, message.penalty, message.tileType);
    }
    findPath(message) {
        const startNode = this.navigationInstance.getNode(message.startX, message.startY);
        const endNode = this.navigationInstance.getNode(message.endX, message.endY);
        const path = this.navigationInstance.findPath(startNode, endNode);
        if (path) {
            self.postMessage(path.map(node => ({ x: node.x, y: node.y })));
        }
        else {
            self.postMessage(undefined);
        }
    }
    getTileLocations(message) {
        const tileLocationTree = this.tileLocations[message.tileType];
        self.postMessage(tileLocationTree ? tileLocationTree.nearestPoint(message.x, message.y) : []);
    }
    getTileLocationWaterIndex(tileType) {
        if (tileType === TerrainType.ShallowSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater) {
            return seawaterTileLocation;
        }
        else if (tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater) {
            return freshWaterTileLocation;
        }
        return undefined;
    }
    _updateTile(x, y, disabled, penalty, tileType) {
        const node = this.navigationInstance.getNode(x, y);
        node.disabled = disabled;
        node.penalty = penalty;
        const kdTreeIndex = (y * 512) + x;
        let kdTreeTileType = this.kdTreeTileTypes[kdTreeIndex];
        let waterIndex;
        if (kdTreeTileType !== 0) {
            kdTreeTileType--;
            if (kdTreeTileType === tileType) {
                return;
            }
            this.tileLocations[kdTreeTileType].deletePoint(x, y);
            waterIndex = this.getTileLocationWaterIndex(kdTreeTileType);
            if (waterIndex !== undefined) {
                this.tileLocations[waterIndex].deletePoint(x, y);
                this.tileLocations[anyWaterTileLocation].deletePoint(x, y);
            }
        }
        this.kdTreeTileTypes[kdTreeIndex] = tileType + 1;
        if (!this.tileLocations[tileType]) {
            this.tileLocations[tileType] = new Module.KDTree();
        }
        this.tileLocations[tileType].insertPoint(x, y);
        waterIndex = this.getTileLocationWaterIndex(tileType);
        if (waterIndex !== undefined) {
            this.tileLocations[waterIndex].insertPoint(x, y);
            this.tileLocations[anyWaterTileLocation].insertPoint(x, y);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxJQUFLLHFCQUtKO0FBTEQsV0FBSyxxQkFBcUI7SUFDekIscUZBQWMsQ0FBQTtJQUNkLDZFQUFVLENBQUE7SUFDVix5RUFBUSxDQUFBO0lBQ1IseUZBQWdCLENBQUE7QUFDakIsQ0FBQyxFQUxJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFLekI7QUFxQ0QsSUFBSyxXQU9KO0FBUEQsV0FBSyxXQUFXO0lBQ2YsNkRBQWdCLENBQUE7SUFDaEIscURBQVksQ0FBQTtJQUNaLG1FQUFtQixDQUFBO0lBQ25CLGlFQUFrQixDQUFBO0lBQ2xCLHlEQUFjLENBQUE7SUFDZCx1RUFBcUIsQ0FBQTtBQUN0QixDQUFDLEVBUEksV0FBVyxLQUFYLFdBQVcsUUFPZjtBQUVELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBSWhDLE1BQU0sVUFBVTtJQU1mO1FBQ0MsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sY0FBYyxDQUFDLE9BQTBCO1FBQy9DLFFBQVEsT0FBTyxDQUFDLElBQUksRUFBRTtZQUNyQixLQUFLLHFCQUFxQixDQUFDLGNBQWM7Z0JBQ3hDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdCLE1BQU07WUFFUCxLQUFLLHFCQUFxQixD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