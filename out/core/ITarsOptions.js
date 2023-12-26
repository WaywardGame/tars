/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "../modes/TreasureHunter", "./ITars"], function (require, exports, TreasureHunter_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createOptions = exports.PlanningAccuracy = exports.TarsUseProtectedItems = void 0;
    var TarsUseProtectedItems;
    (function (TarsUseProtectedItems) {
        TarsUseProtectedItems[TarsUseProtectedItems["No"] = 0] = "No";
        TarsUseProtectedItems[TarsUseProtectedItems["Yes"] = 1] = "Yes";
        TarsUseProtectedItems[TarsUseProtectedItems["YesWithBreakCheck"] = 2] = "YesWithBreakCheck";
    })(TarsUseProtectedItems || (exports.TarsUseProtectedItems = TarsUseProtectedItems = {}));
    var PlanningAccuracy;
    (function (PlanningAccuracy) {
        PlanningAccuracy[PlanningAccuracy["Simple"] = 0] = "Simple";
        PlanningAccuracy[PlanningAccuracy["Accurate"] = 1] = "Accurate";
    })(PlanningAccuracy || (exports.PlanningAccuracy = PlanningAccuracy = {}));
    function createOptions(initialOptions = {}) {
        return {
            mode: ITars_1.TarsMode.Survival,
            stayHealthy: true,
            allowCaves: false,
            allowBackpacks: true,
            lockInventory: false,
            lockEquipment: false,
            useProtectedItems: TarsUseProtectedItems.No,
            useProtectedItemsForEquipment: true,
            goodCitizen: isWebWorker ? false : true,
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
            survivalMaintainLowDifficulty: false,
            gardenerOnlyEdiblePlants: true,
            harvesterOnlyUseHands: false,
            treasureHunterPrecognition: false,
            treasureHunterType: TreasureHunter_1.TreasureHunterType.DiscoverAndUnlockTreasure,
            planningAccuracy: PlanningAccuracy.Accurate,
            limitGroundItemSearch: true,
            limitDisassembleItemSearch: true,
            quantumBurst: false,
            debugLogging: false,
            navigationOverlays: false,
            freeze: false,
            preventNotes: true,
            ...initialOptions,
        };
    }
    exports.createOptions = createOptions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvSVRhcnNPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUF1REgsSUFBWSxxQkFJWDtJQUpELFdBQVkscUJBQXFCO1FBQ2hDLDZEQUFFLENBQUE7UUFDRiwrREFBRyxDQUFBO1FBQ0gsMkZBQWlCLENBQUE7SUFDbEIsQ0FBQyxFQUpXLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBSWhDO0lBRUQsSUFBWSxnQkFHWDtJQUhELFdBQVksZ0JBQWdCO1FBQzNCLDJEQUFNLENBQUE7UUFDTiwrREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUhXLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBRzNCO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLGlCQUF3QyxFQUFFO1FBQ3ZFLE9BQU87WUFDTixJQUFJLEVBQUUsZ0JBQVEsQ0FBQyxRQUFRO1lBRXZCLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1lBRXBCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGFBQWEsRUFBRSxLQUFLO1lBQ3BCLGlCQUFpQixFQUFFLHFCQUFxQixDQUFDLEVBQUU7WUFDM0MsNkJBQTZCLEVBQUUsSUFBSTtZQUVuQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFFdkMsc0JBQXNCLEVBQUUsRUFBRTtZQUMxQix1QkFBdUIsRUFBRSxFQUFFO1lBQzNCLHNCQUFzQixFQUFFLENBQUM7WUFDekIsc0JBQXNCLEVBQUUsRUFBRTtZQUMxQiw2QkFBNkIsRUFBRSxDQUFDLEVBQUU7WUFFbEMsc0JBQXNCLEVBQUUsSUFBSTtZQUM1QiwwQkFBMEIsRUFBRSxJQUFJO1lBQ2hDLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLDZCQUE2QixFQUFFLEtBQUs7WUFFcEMsd0JBQXdCLEVBQUUsSUFBSTtZQUU5QixxQkFBcUIsRUFBRSxLQUFLO1lBRTVCLDBCQUEwQixFQUFFLEtBQUs7WUFDakMsa0JBQWtCLEVBQUUsbUNBQWtCLENBQUMseUJBQXlCO1lBRWhFLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLFFBQVE7WUFFM0MscUJBQXFCLEVBQUUsSUFBSTtZQUMzQiwwQkFBMEIsRUFBRSxJQUFJO1lBRWhDLFlBQVksRUFBRSxLQUFLO1lBRW5CLFlBQVksRUFBRSxLQUFLO1lBQ25CLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsTUFBTSxFQUFFLEtBQUs7WUFDYixZQUFZLEVBQUUsSUFBSTtZQUVsQixHQUFHLGNBQWM7U0FDakIsQ0FBQztJQUNILENBQUM7SUFqREQsc0NBaURDIn0=