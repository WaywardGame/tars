define(["require", "exports", "game/entity/IStats", "./core/ITarsOptions", "./modes/TreasureHunter"], function (require, exports, IStats_1, ITarsOptions_1, TreasureHunter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uiConfigurableModeOptions = exports.uiConfigurableGlobalOptions = exports.TarsOptionSectionType = exports.TarsTranslation = exports.TarsUiSaveDataKey = exports.getTarsSaveData = exports.getTarsTranslation = exports.setTarsMod = exports.getTarsMod = exports.TARS_ID = void 0;
    exports.TARS_ID = "TARS";
    let tarsMod;
    function getTarsMod() {
        if (!tarsMod) {
            throw new Error("Invalid Tars instance");
        }
        return tarsMod;
    }
    exports.getTarsMod = getTarsMod;
    function setTarsMod(instance) {
        tarsMod = instance;
    }
    exports.setTarsMod = setTarsMod;
    function getTarsTranslation(translation) {
        return getTarsMod().getTranslation(translation);
    }
    exports.getTarsTranslation = getTarsTranslation;
    function getTarsSaveData(key) {
        return getTarsMod().saveData[key];
    }
    exports.getTarsSaveData = getTarsSaveData;
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogOpened"] = 0] = "DialogOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToIslandDropdown"] = 4] = "MoveToIslandDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToTerrainDropdown"] = 5] = "MoveToTerrainDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToDoodadDropdown"] = 6] = "MoveToDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToCreatureDropdown"] = 7] = "MoveToCreatureDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToPlayerDropdown"] = 8] = "MoveToPlayerDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToNPCDropdown"] = 9] = "MoveToNPCDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["TameCreatureDropdown"] = 10] = "TameCreatureDropdown";
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
    var TarsTranslation;
    (function (TarsTranslation) {
        TarsTranslation[TarsTranslation["Name"] = 0] = "Name";
        TarsTranslation[TarsTranslation["DialogTitleMain"] = 1] = "DialogTitleMain";
        TarsTranslation[TarsTranslation["DialogStatusNavigatingInitializing"] = 2] = "DialogStatusNavigatingInitializing";
        TarsTranslation[TarsTranslation["DialogPanelGeneral"] = 3] = "DialogPanelGeneral";
        TarsTranslation[TarsTranslation["DialogPanelTasks"] = 4] = "DialogPanelTasks";
        TarsTranslation[TarsTranslation["DialogPanelMoveTo"] = 5] = "DialogPanelMoveTo";
        TarsTranslation[TarsTranslation["DialogPanelGlobalOptions"] = 6] = "DialogPanelGlobalOptions";
        TarsTranslation[TarsTranslation["DialogPanelModeOptions"] = 7] = "DialogPanelModeOptions";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItems"] = 8] = "DialogButtonAllowProtectedItems";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsTooltip"] = 9] = "DialogButtonAllowProtectedItemsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsWithBreakCheck"] = 10] = "DialogButtonAllowProtectedItemsWithBreakCheck";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsWithBreakCheckTooltip"] = 11] = "DialogButtonAllowProtectedItemsWithBreakCheckTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAquireItem"] = 12] = "DialogButtonAquireItem";
        TarsTranslation[TarsTranslation["DialogButtonAquireItemTooltip"] = 13] = "DialogButtonAquireItemTooltip";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodad"] = 14] = "DialogButtonBuildDoodad";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodadTooltip"] = 15] = "DialogButtonBuildDoodadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDebugLogging"] = 16] = "DialogButtonDebugLogging";
        TarsTranslation[TarsTranslation["DialogButtonDebugLoggingTooltip"] = 17] = "DialogButtonDebugLoggingTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItems"] = 18] = "DialogButtonDisallowProtectedItems";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItemsTooltip"] = 19] = "DialogButtonDisallowProtectedItemsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasure"] = 20] = "DialogButtonDiscoverAndUnlockTreasure";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasureTooltip"] = 21] = "DialogButtonDiscoverAndUnlockTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 22] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 23] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 24] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonFreeze"] = 25] = "DialogButtonFreeze";
        TarsTranslation[TarsTranslation["DialogButtonFreezeTooltip"] = 26] = "DialogButtonFreezeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonFasterPlanning"] = 27] = "DialogButtonFasterPlanning";
        TarsTranslation[TarsTranslation["DialogButtonFasterPlanningTooltip"] = 28] = "DialogButtonFasterPlanningTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizen"] = 29] = "DialogButtonGoodCitizen";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizenTooltip"] = 30] = "DialogButtonGoodCitizenTooltip";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHands"] = 31] = "DialogButtonHarvesterOnlyUseHands";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHandsTooltip"] = 32] = "DialogButtonHarvesterOnlyUseHandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasure"] = 33] = "DialogButtonObtainTreasure";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasureTooltip"] = 34] = "DialogButtonObtainTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasure"] = 35] = "DialogButtonOnlyDiscoverTreasure";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasureTooltip"] = 36] = "DialogButtonOnlyDiscoverTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonPrecognition"] = 37] = "DialogButtonPrecognition";
        TarsTranslation[TarsTranslation["DialogButtonPrecognitionTooltip"] = 38] = "DialogButtonPrecognitionTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 39] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 40] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowCaves"] = 41] = "DialogButtonAllowCaves";
        TarsTranslation[TarsTranslation["DialogButtonAllowCavesTooltip"] = 42] = "DialogButtonAllowCavesTooltip";
        TarsTranslation[TarsTranslation["DialogButtonReadBooks"] = 43] = "DialogButtonReadBooks";
        TarsTranslation[TarsTranslation["DialogButtonReadBooksTooltip"] = 44] = "DialogButtonReadBooksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonClearSwamps"] = 45] = "DialogButtonClearSwamps";
        TarsTranslation[TarsTranslation["DialogButtonClearSwampsTooltip"] = 46] = "DialogButtonClearSwampsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBase"] = 47] = "DialogButtonOrganizeBase";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBaseTooltip"] = 48] = "DialogButtonOrganizeBaseTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 49] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 50] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 51] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 52] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 53] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 54] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 55] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 56] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 57] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 58] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 59] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 60] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 61] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 62] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 63] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogRangeLabel"] = 64] = "DialogRangeLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 65] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 66] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 67] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 68] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 69] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 70] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 71] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 72] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 73] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 74] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 75] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 76] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 77] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 78] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 79] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 80] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 81] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 82] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 83] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 84] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 85] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 86] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 87] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 88] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 89] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 90] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 91] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 92] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 93] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 94] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 95] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 96] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 97] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 98] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 99] = "DialogModeTreasureHunterTooltip";
    })(TarsTranslation = exports.TarsTranslation || (exports.TarsTranslation = {}));
    var TarsOptionSectionType;
    (function (TarsOptionSectionType) {
        TarsOptionSectionType[TarsOptionSectionType["Checkbox"] = 0] = "Checkbox";
        TarsOptionSectionType[TarsOptionSectionType["Choice"] = 1] = "Choice";
        TarsOptionSectionType[TarsOptionSectionType["Slider"] = 2] = "Slider";
    })(TarsOptionSectionType = exports.TarsOptionSectionType || (exports.TarsOptionSectionType = {}));
    exports.uiConfigurableGlobalOptions = [
        TarsTranslation.DialogLabelGeneral,
        {
            option: "stayHealthy",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonStayHealthy,
            tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
        },
        {
            option: "allowCaves",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonAllowCaves,
            tooltip: TarsTranslation.DialogButtonAllowCavesTooltip,
        },
        TarsTranslation.DialogLabelItemProtection,
        {
            option: "useProtectedItems",
            type: TarsOptionSectionType.Choice,
            choices: [
                [TarsTranslation.DialogButtonDisallowProtectedItems, TarsTranslation.DialogButtonDisallowProtectedItemsTooltip, ITarsOptions_1.TarsUseProtectedItems.No],
                [TarsTranslation.DialogButtonAllowProtectedItems, TarsTranslation.DialogButtonAllowProtectedItemsTooltip, ITarsOptions_1.TarsUseProtectedItems.Yes],
                [TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheck, TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheckTooltip, ITarsOptions_1.TarsUseProtectedItems.YesWithBreakCheck],
            ],
        },
        TarsTranslation.DialogLabelMultiplayer,
        {
            option: "goodCitizen",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonGoodCitizen,
            tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
        },
        TarsTranslation.DialogLabelDeveloper,
        {
            option: "debugLogging",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonDebugLogging,
            tooltip: TarsTranslation.DialogButtonDebugLoggingTooltip,
        },
        {
            option: "freeze",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonFreeze,
            tooltip: TarsTranslation.DialogButtonFreezeTooltip,
        },
        {
            option: "fasterPlanning",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonFasterPlanning,
            tooltip: TarsTranslation.DialogButtonFasterPlanningTooltip,
        },
        TarsTranslation.DialogLabelRecoverThresholds,
        {
            option: "recoverThresholdHealth",
            type: TarsOptionSectionType.Slider,
            title: TarsTranslation.DialogRangeRecoverHealthThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.human.stat.get(IStats_1.Stat.Health).max,
            }
        },
        {
            option: "recoverThresholdStamina",
            type: TarsOptionSectionType.Slider,
            title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.human.stat.get(IStats_1.Stat.Stamina).max,
            }
        },
        {
            option: "recoverThresholdHunger",
            type: TarsOptionSectionType.Slider,
            title: TarsTranslation.DialogRangeRecoverHungerThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.human.stat.get(IStats_1.Stat.Hunger).max,
            }
        },
        {
            option: "recoverThresholdThirst",
            type: TarsOptionSectionType.Slider,
            title: TarsTranslation.DialogRangeRecoverThirstThreshold,
            tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
            slider: {
                min: 0,
                max: (context) => context.human.stat.get(IStats_1.Stat.Thirst).max,
            }
        },
    ];
    exports.uiConfigurableModeOptions = [
        TarsTranslation.DialogModeSurvival,
        {
            option: "survivalExploreIslands",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonExploreIslands,
            tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
        },
        {
            option: "survivalUseOrbsOfInfluence",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
            tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
        },
        {
            option: "survivalReadBooks",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonReadBooks,
            tooltip: TarsTranslation.DialogButtonReadBooksTooltip,
        },
        {
            option: "survivalClearSwamps",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonClearSwamps,
            tooltip: TarsTranslation.DialogButtonClearSwampsTooltip,
        },
        {
            option: "survivalOrganizeBase",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonOrganizeBase,
            tooltip: TarsTranslation.DialogButtonOrganizeBaseTooltip,
        },
        TarsTranslation.DialogModeHarvester,
        {
            option: "harvestOnlyUseHands",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonHarvesterOnlyUseHands,
            tooltip: TarsTranslation.DialogButtonHarvesterOnlyUseHandsTooltip,
        },
        TarsTranslation.DialogModeTreasureHunter,
        {
            option: "treasureHunterPrecognition",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonPrecognition,
            tooltip: TarsTranslation.DialogButtonPrecognitionTooltip,
        },
        {
            option: "treasureHunterType",
            type: TarsOptionSectionType.Choice,
            choices: [
                [TarsTranslation.DialogButtonOnlyDiscoverTreasure, TarsTranslation.DialogButtonOnlyDiscoverTreasureTooltip, TreasureHunter_1.TreasureHunterType.OnlyDiscoverTreasure],
                [TarsTranslation.DialogButtonDiscoverAndUnlockTreasure, TarsTranslation.DialogButtonDiscoverAndUnlockTreasureTooltip, TreasureHunter_1.TreasureHunterType.DiscoverAndUnlockTreasure],
                [TarsTranslation.DialogButtonObtainTreasure, TarsTranslation.DialogButtonObtainTreasureTooltip, TreasureHunter_1.TreasureHunterType.ObtainTreasure],
            ],
        },
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUE0QixHQUFNO1FBQzdELE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCwwQ0FFQztJQTJCRCxJQUFZLGlCQVlYO0lBWkQsV0FBWSxpQkFBaUI7UUFDekIseUVBQVksQ0FBQTtRQUNaLDJFQUFhLENBQUE7UUFDYix1RkFBbUIsQ0FBQTtRQUNuQix1RkFBbUIsQ0FBQTtRQUNuQix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQix5RkFBb0IsQ0FBQTtRQUNwQiw2RkFBc0IsQ0FBQTtRQUN0Qix5RkFBb0IsQ0FBQTtRQUNwQixtRkFBaUIsQ0FBQTtRQUNqQiwwRkFBb0IsQ0FBQTtJQUN4QixDQUFDLEVBWlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFZNUI7SUFFRCxJQUFZLGVBNkdYO0lBN0dELFdBQVksZUFBZTtRQUN2QixxREFBSSxD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