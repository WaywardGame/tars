define(["require", "exports", "../modes/TreasureHunter", "./ITars"], function (require, exports, TreasureHunter_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createOptions = exports.TarsUseProtectedItems = void 0;
    var TarsUseProtectedItems;
    (function (TarsUseProtectedItems) {
        TarsUseProtectedItems[TarsUseProtectedItems["No"] = 0] = "No";
        TarsUseProtectedItems[TarsUseProtectedItems["Yes"] = 1] = "Yes";
        TarsUseProtectedItems[TarsUseProtectedItems["YesWithBreakCheck"] = 2] = "YesWithBreakCheck";
    })(TarsUseProtectedItems = exports.TarsUseProtectedItems || (exports.TarsUseProtectedItems = {}));
    function createOptions(initialOptions = {}) {
        return {
            mode: ITars_1.TarsMode.Survival,
            stayHealthy: true,
            allowCaves: false,
            lockInventory: false,
            lockEquipment: false,
            useProtectedItems: TarsUseProtectedItems.No,
            useProtectedItemsForEquipment: true,
            goodCitizen: true,
            recoverThresholdHealth: 30,
            recoverThresholdStamina: 20,
            recoverThresholdHunger: 8,
            recoverThresholdThirst: 10,
            recoverThresholdThirstFromMax: -10,
            survivalExploreIslands: true,
            survivalUseOrbsOfInfluence: true,
            survivalReadBooks: true,
            survivalClearSwamps: true,
            survivalOrganizeBase: true,
            harvestOnlyUseHands: false,
            treasureHunterPrecognition: false,
            treasureHunterType: TreasureHunter_1.TreasureHunterType.DiscoverAndUnlockTreasure,
            quantumBurst: false,
            debugLogging: false,
            freeze: false,
            ...initialOptions,
        };
    }
    exports.createOptions = createOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvSVRhcnNPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUEwQ0EsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLDZEQUFFLENBQUE7UUFDRiwrREFBRyxDQUFBO1FBQ0gsMkZBQWlCLENBQUE7SUFDckIsQ0FBQyxFQUpXLHFCQUFxQixHQUFyQiw2QkFBcUIsS0FBckIsNkJBQXFCLFFBSWhDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLGlCQUF3QyxFQUFFO1FBQ3BFLE9BQU87WUFDSCxJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRO1lBRXZCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFVBQVUsRUFBRSxLQUFLO1lBRWpCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLEVBQUU7WUFDM0MsNkJBQTZCLEVBQUUsSUFBSTtZQUVuQyxXQUFXLEVBQUUsSUFBSTtZQUVqQixzQkFBc0IsRUFBRSxFQUFFO1lBQzFCLHVCQUF1QixFQUFFLEVBQUU7WUFDM0Isc0JBQXNCLEVBQUUsQ0FBQztZQUN6QixzQkFBc0IsRUFBRSxFQUFFO1lBQzFCLDZCQUE2QixFQUFFLENBQUMsRUFBRTtZQUVsQyxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLDBCQUEwQixFQUFFLElBQUk7WUFDaEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixtQkFBbUIsRUFBRSxJQUFJO1lBQ3pCLG9CQUFvQixFQUFFLElBQUk7WUFFMUIsbUJBQW1CLEVBQUUsS0FBSztZQUUxQiwwQkFBMEIsRUFBRSxLQUFLO1lBQ2pDLGtCQUFrQixFQUFFLG1DQUFrQixDQUFDLHlCQUF5QjtZQUVoRSxZQUFZLEVBQUUsS0FBSztZQUNuQixZQUFZLEVBQUUsS0FBSztZQUNuQixNQUFNLEVBQUUsS0FBSztZQUViLEdBQUcsY0FBYztTQUNwQixDQUFDO0lBQ04sQ0FBQztJQXJDRCxzQ0FxQ0MifQ==