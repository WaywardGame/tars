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
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizen"] = 27] = "DialogButtonGoodCitizen";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizenTooltip"] = 28] = "DialogButtonGoodCitizenTooltip";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHands"] = 29] = "DialogButtonHarvesterOnlyUseHands";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHandsTooltip"] = 30] = "DialogButtonHarvesterOnlyUseHandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasure"] = 31] = "DialogButtonObtainTreasure";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasureTooltip"] = 32] = "DialogButtonObtainTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasure"] = 33] = "DialogButtonOnlyDiscoverTreasure";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasureTooltip"] = 34] = "DialogButtonOnlyDiscoverTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonPrecognition"] = 35] = "DialogButtonPrecognition";
        TarsTranslation[TarsTranslation["DialogButtonPrecognitionTooltip"] = 36] = "DialogButtonPrecognitionTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 37] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 38] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonReadBooks"] = 39] = "DialogButtonReadBooks";
        TarsTranslation[TarsTranslation["DialogButtonReadBooksTooltip"] = 40] = "DialogButtonReadBooksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonClearSwamps"] = 41] = "DialogButtonClearSwamps";
        TarsTranslation[TarsTranslation["DialogButtonClearSwampsTooltip"] = 42] = "DialogButtonClearSwampsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBase"] = 43] = "DialogButtonOrganizeBase";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBaseTooltip"] = 44] = "DialogButtonOrganizeBaseTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 45] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 46] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 47] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 48] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 49] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 50] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 51] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 52] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 53] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 54] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 55] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 56] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 57] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 58] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 59] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogRangeLabel"] = 60] = "DialogRangeLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 61] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 62] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 63] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 64] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 65] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 66] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 67] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 68] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 69] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 70] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 71] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 72] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 73] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 74] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 75] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 76] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 77] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 78] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 79] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 80] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 81] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 82] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 83] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 84] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 85] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 86] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 87] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 88] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 89] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 90] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 91] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 92] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 93] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 94] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 95] = "DialogModeTreasureHunterTooltip";
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
        TarsTranslation.DialogLabelAdvanced,
        {
            option: "quantumBurst",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonQuantumBurst,
            tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUE0QixHQUFNO1FBQzdELE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCwwQ0FFQztJQTJCRCxJQUFZLGlCQVlYO0lBWkQsV0FBWSxpQkFBaUI7UUFDekIseUVBQVksQ0FBQTtRQUNaLDJFQUFhLENBQUE7UUFDYix1RkFBbUIsQ0FBQTtRQUNuQix1RkFBbUIsQ0FBQTtRQUNuQix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQix5RkFBb0IsQ0FBQTtRQUNwQiw2RkFBc0IsQ0FBQTtRQUN0Qix5RkFBb0IsQ0FBQTtRQUNwQixtRkFBaUIsQ0FBQTtRQUNqQiwwRkFBb0IsQ0FBQTtJQUN4QixDQUFDLEVBWlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFZNUI7SUFFRCxJQUFZLGVBeUdYO0lBekdELFdBQVksZUFBZTtRQUN2QixxREFBSSxD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