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
define(["require", "exports", "@wayward/game/game/deity/Deity", "../modes/TreasureHunter", "./ITars"], function (require, exports, Deity_1, TreasureHunter_1, ITars_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlanningAccuracy = exports.TarsUseProtectedItems = void 0;
    exports.createOptions = createOptions;
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
            deity: Deity_1.Deity.Neutral,
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
            survivalStartWaterSources: true,
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNPcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvcmUvSVRhcnNPcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7Ozs7SUFzRUgsc0NBb0RDO0lBL0RELElBQVkscUJBSVg7SUFKRCxXQUFZLHFCQUFxQjtRQUNoQyw2REFBRSxDQUFBO1FBQ0YsK0RBQUcsQ0FBQTtRQUNILDJGQUFpQixDQUFBO0lBQ2xCLENBQUMsRUFKVyxxQkFBcUIscUNBQXJCLHFCQUFxQixRQUloQztJQUVELElBQVksZ0JBR1g7SUFIRCxXQUFZLGdCQUFnQjtRQUMzQiwyREFBTSxDQUFBO1FBQ04sK0RBQVEsQ0FBQTtJQUNULENBQUMsRUFIVyxnQkFBZ0IsZ0NBQWhCLGdCQUFnQixRQUczQjtJQUVELFNBQWdCLGFBQWEsQ0FBQyxpQkFBd0MsRUFBRTtRQUN2RSxPQUFPO1lBQ04sSUFBSSxFQUFFLGdCQUFRLENBQUMsUUFBUTtZQUV2QixXQUFXLEVBQUUsSUFBSTtZQUNqQixVQUFVLEVBQUUsS0FBSztZQUNqQixjQUFjLEVBQUUsSUFBSTtZQUVwQixhQUFhLEVBQUUsS0FBSztZQUNwQixhQUFhLEVBQUUsS0FBSztZQUNwQixpQkFBaUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFO1lBQzNDLDZCQUE2QixFQUFFLElBQUk7WUFFbkMsS0FBSyxFQUFFLGFBQUssQ0FBQyxPQUFPO1lBRXBCLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUV2QyxzQkFBc0IsRUFBRSxFQUFFO1lBQzFCLHVCQUF1QixFQUFFLEVBQUU7WUFDM0Isc0JBQXNCLEVBQUUsQ0FBQztZQUN6QixzQkFBc0IsRUFBRSxFQUFFO1lBQzFCLDZCQUE2QixFQUFFLENBQUMsRUFBRTtZQUVsQyxzQkFBc0IsRUFBRSxJQUFJO1lBQzVCLDBCQUEwQixFQUFFLElBQUk7WUFDaEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixtQkFBbUIsRUFBRSxJQUFJO1lBQ3pCLG9CQUFvQixFQUFFLElBQUk7WUFDMUIseUJBQXlCLEVBQUUsSUFBSTtZQUMvQiw2QkFBNkIsRUFBRSxLQUFLO1lBRXBDLHdCQUF3QixFQUFFLElBQUk7WUFFOUIscUJBQXFCLEVBQUUsS0FBSztZQUU1QiwwQkFBMEIsRUFBRSxLQUFLO1lBQ2pDLGtCQUFrQixFQUFFLG1DQUFrQixDQUFDLHlCQUF5QjtZQUVoRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRO1lBRTNDLHFCQUFxQixFQUFFLElBQUk7WUFDM0IsMEJBQTBCLEVBQUUsSUFBSTtZQUVoQyxZQUFZLEVBQUUsS0FBSztZQUVuQixZQUFZLEVBQUUsS0FBSztZQUNuQixrQkFBa0IsRUFBRSxLQUFLO1lBQ3pCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsWUFBWSxFQUFFLElBQUk7WUFFbEIsR0FBRyxjQUFjO1NBQ2pCLENBQUM7SUFDSCxDQUFDIn0=