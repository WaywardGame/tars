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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9OYXZpZ2F0aW9uV29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFHQSxJQUFLLHFCQUtKO0FBTEQsV0FBSyxxQkFBcUI7SUFDekIscUZBQWMsQ0FBQTtJQUNkLDZFQUFVLENBQUE7SUFDVix5RUFBUSxDQUFBO0lBQ1IseUZBQWdCLENBQUE7QUFDakIsQ0FBQyxFQUxJLHFCQUFxQixLQUFyQixxQkFBcUIsUUFLekI7QUFxQ0QsSUFBSyxXQU9KO0FBUEQsV0FBSyxXQUFXO0lBQ2YsNkRBQWdCLENBQUE7SUFDaEIscURBQVksQ0FBQTtJQUNaLG1FQUFtQixDQUFBO0lBQ25CLGlFQUFrQixDQUFBO0lBQ2xCLHlEQUFjLENBQUE7SUFDZCx1RUFBcUIsQ0FBQTtBQUN0QixDQUFDLEVBUEksV0FBVyxLQUFYLFdBQVcsUUFPZjtBQUVELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBSWhDO0lBTUM7UUFDQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxVQUFVLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxjQUFjLENBQUMsT0FBMEI7UUFDL0MsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ3JCLEtBQUsscUJBQXFCLENBQUMsY0FBYztnQkFDeEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsTUFBTTtZQUVQLEtBQUsscUJBQXFCLENBQUMsVUFBVTtn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