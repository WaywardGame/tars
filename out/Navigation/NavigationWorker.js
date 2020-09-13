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
    TerrainType[TerrainType["FreezingFreshWater"] = 41] = "FreezingFreshWater";
    TerrainType[TerrainType["FreezingSeawater"] = 43] = "FreezingSeawater";
})(TerrainType || (TerrainType = {}));
var WorldZ;
(function (WorldZ) {
    WorldZ[WorldZ["Min"] = 0] = "Min";
    WorldZ[WorldZ["Max"] = 1] = "Max";
    WorldZ[WorldZ["Cave"] = 0] = "Cave";
    WorldZ[WorldZ["Overworld"] = 1] = "Overworld";
})(WorldZ || (WorldZ = {}));
const freshWaterTileLocation = -1;
const anyWaterTileLocation = -2;
let mapSize;
let mapSizeSq;
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
        const isFreshWater = tileType === TerrainType.ShallowFreshWater || tileType === TerrainType.FreezingFreshWater || tileType === TerrainType.FreshWater || tileType === TerrainType.DeepFreshWater;
        const isSeawater = tileType === TerrainType.ShallowSeawater || tileType === TerrainType.FreezingSeawater || tileType === TerrainType.Seawater || tileType === TerrainType.DeepSeawater;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF2aWdhdGlvbldvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9OYXZpZ2F0aW9uL05hdmlnYXRpb25Xb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQWFBLElBQUsscUJBSUo7QUFKRCxXQUFLLHFCQUFxQjtJQUN6QixxRkFBYyxDQUFBO0lBQ2QsNkVBQVUsQ0FBQTtJQUNWLHlGQUFnQixDQUFBO0FBQ2pCLENBQUMsRUFKSSxxQkFBcUIsS0FBckIscUJBQXFCLFFBSXpCO0FBMENELElBQUssV0FTSjtBQVRELFdBQUssV0FBVztJQUNmLDZEQUFnQixDQUFBO0lBQ2hCLHFEQUFZLENBQUE7SUFDWixtRUFBbUIsQ0FBQTtJQUNuQixpRUFBa0IsQ0FBQTtJQUNsQix5REFBYyxDQUFBO0lBQ2QsdUVBQXFCLENBQUE7SUFDckIsMEVBQXVCLENBQUE7SUFDdkIsc0VBQXFCLENBQUE7QUFDdEIsQ0FBQyxFQVRJLFdBQVcsS0FBWCxXQUFXLFFBU2Y7QUFFRCxJQUFLLE1BS0o7QUFMRCxXQUFLLE1BQU07SUFDVixpQ0FBTyxDQUFBO0lBQ1AsaUNBQU8sQ0FBQTtJQUNQLG1DQUFRLENBQUE7SUFDUiw2Q0FBYSxDQUFBO0FBQ2QsQ0FBQyxFQUxJLE1BQU0sS0FBTixNQUFNLFFBS1Y7QUFFRCxNQUFNLHNCQUFzQixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFaEMsSUFBSSxPQUFlLENBQUM7QUFDcEIsSUFBSSxTQUFpQixDQUFDO0FBU3RCLE1BQU0sVUFBVTtJQUlmO1FBRmlCLG1CQUFjLEdBQXlDLEVBQUUsQ0FBQztRQUcxRSxLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsR0FBRztnQkFDeEIsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLGVBQWUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUM7YUFDMUMsQ0FBQztTQUNGO0lBQ0YsQ0FBQztJQUVNLGNBQWMsQ0FBQyxPQUEwQjtRQUMvQyxJQUFJLFFBQWEsQ0FBQztRQUVsQixRQUFRLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDckIsS0FBSyxxQkFBcUIsQ0FBQyxjQUFjO2dCQUN4QyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEMsTUFBTTtZQUVQLEtBQUsscUJBQXFCLENBQUMsVUFBVTtnQkFDcEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekIsTUFBTTtZQUVQLEtBQUsscUJBQXFCLENBQUMsZ0JBQWdCO2dCQUMxQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxNQUFNO1NBQ1A7UUFFRCxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxXQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3BDO0lBQ0YsQ0FBQztJQUVPLGNBQWMsQ0FBQyxPQUErQjtRQUNyRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBRTVCLEtBQUssSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BCLFNBQVM7YUFDVDtZQUVELGNBQWMsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzRSxjQUFjLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFekUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDakMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDakMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUU5RCxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBRWxDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2lCQUN4RjthQUNEO1NBQ0Q7UUFFRCxPQUFPO1lBQ04sSUFBSSxFQUFFLHFCQUFxQixDQUFDLGNBQWM7U0FDMUMsQ0FBQztJQUNILENBQUM7SUFFTyxVQUFVLENBQUMsT0FBMkI7UUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BILENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxPQUFpQztRQUN6RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWhDLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFeEUsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFcEcsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUV2QyxPQUFPO1lBQ04sSUFBSSxFQUFFLHFCQUFxQixDQUFDLGdCQUFnQjtZQUM1QyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUc7WUFDaEIsTUFBTSxFQUFFLE1BQU07WUFDZCxXQUFXLEVBQUUsSUFBSTtTQUNqQixDQUFDO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxRQUFpQixFQUFFLE9BQWUsRUFBRSxRQUFnQixFQUFFLGlCQUFrQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNsSyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztTQUMzQztRQUVELE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRWpFLElBQUksY0FBYyxLQUFLLENBQUMsRUFBRTtZQUN6QixjQUFjLEVBQUUsQ0FBQztZQUVqQixJQUFJLGNBQWMsS0FBSyxRQUFRLEVBQUU7Z0JBQ2hDLE9BQU87YUFDUDtZQUlELGNBQWMsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ25FO1FBRUQsY0FBYyxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRTNELElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzVDLGNBQWMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDN0Q7UUFFRCxjQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFekQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsY0FBK0IsRUFBRSxRQUFxQixFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsTUFBZTtRQUNySCxNQUFNLFlBQVksR0FBRyxRQUFRLEtBQUssV0FBVyxDQUFDLGlCQUFpQixJQUFJLFFBQVEsS0FBSyxXQUFXLENBQUMsa0JBQWtCLElBQUksUUFBUSxLQUFLLFdBQVcsQ0FBQyxVQUFVLElBQUksUUFBUSxLQUFLLFdBQVcsQ0FBQyxjQUFjLENBQUM7UUFDak0sTUFBTSxVQUFVLEdBQUcsUUFBUSxLQUFLLFdBQVcsQ0FBQyxlQUFlLElBQUksUUFBUSxLQUFLLFdBQVcsQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLEtBQUssV0FBVyxDQUFDLFFBQVEsSUFBSSxRQUFRLEtBQUssV0FBVyxDQUFDLFlBQVksQ0FBQztRQUV2TCxJQUFJLFlBQVksSUFBSSxVQUFVLEVBQUU7WUFDL0IsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsY0FBYyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFFckU7aUJBQU07Z0JBQ04sY0FBYyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDckU7WUFFRCxJQUFJLFlBQVksRUFBRTtnQkFDakIsSUFBSSxNQUFNLEVBQUU7b0JBQ1gsY0FBYyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBRXZFO3FCQUFNO29CQUNOLGNBQWMsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2RTthQUNEO1NBQ0Q7SUFDRixDQUFDO0NBQ0Q7QUFFRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDM0IsSUFBSSxjQUErQyxDQUFDO0FBR3BELFNBQVMscUJBQXFCO0lBRzdCLE1BQU0sVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7SUFFcEMsSUFBSSxjQUFjLEVBQUU7UUFDbkIsS0FBSyxNQUFNLE9BQU8sSUFBSSxjQUFjLEVBQUU7WUFDckMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQztRQUVELGNBQWMsR0FBRyxTQUFTLENBQUM7S0FDM0I7SUFFRCxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBbUIsRUFBRSxFQUFFO1FBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQztBQUNILENBQUM7QUFHRCxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBbUIsRUFBRSxFQUFFO0lBQ2pELElBQUksY0FBYyxFQUFFO1FBQ25CLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE9BQU87S0FDUDtJQUVELGNBQWMsR0FBRyxFQUFFLENBQUM7SUFFcEIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7SUFFekMsT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzdCLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUdqQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFFdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUUsS0FBa0IsRUFBRSxJQUFrQixFQUFxQixFQUFFO1FBQ2hGLEtBQUssR0FBRyxHQUFHLFVBQVUsNEJBQTRCLENBQUM7UUFDbEQsT0FBTyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUMsQ0FBQztJQUVGLGFBQWEsQ0FBQyxHQUFHLFVBQVUsMEJBQTBCLENBQUMsQ0FBQztBQUN4RCxDQUFDLENBQUMifQ==