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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvSVRhcnNPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUF5Q0EsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQzdCLDZEQUFFLENBQUE7UUFDRiwrREFBRyxDQUFBO1FBQ0gsMkZBQWlCLENBQUE7SUFDckIsQ0FBQyxFQUpXLHFCQUFxQixHQUFyQiw2QkFBcUIsS0FBckIsNkJBQXFCLFFBSWhDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLGlCQUF3QyxFQUFFO1FBQ3BFLE9BQU87WUFDSCxJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRO1lBRXZCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFVBQVUsRUFBRSxLQUFLO1lBRWpCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLEVBQUU7WUFFM0MsV0FBVyxFQUFFLElBQUk7WUFFakIsc0JBQXNCLEVBQUUsRUFBRTtZQUMxQix1QkFBdUIsRUFBRSxFQUFFO1lBQzNCLHNCQUFzQixFQUFFLENBQUM7WUFDekIsc0JBQXNCLEVBQUUsRUFBRTtZQUMxQiw2QkFBNkIsRUFBRSxDQUFDLEVBQUU7WUFFbEMsc0JBQXNCLEVBQUUsSUFBSTtZQUM1QiwwQkFBMEIsRUFBRSxJQUFJO1lBQ2hDLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixvQkFBb0IsRUFBRSxJQUFJO1lBRTFCLG1CQUFtQixFQUFFLEtBQUs7WUFFMUIsMEJBQTBCLEVBQUUsS0FBSztZQUNqQyxrQkFBa0IsRUFBRSxtQ0FBa0IsQ0FBQyx5QkFBeUI7WUFFaEUsWUFBWSxFQUFFLEtBQUs7WUFDbkIsWUFBWSxFQUFFLEtBQUs7WUFDbkIsTUFBTSxFQUFFLEtBQUs7WUFFYixHQUFHLGNBQWM7U0FDcEIsQ0FBQztJQUNOLENBQUM7SUFwQ0Qsc0NBb0NDIn0=