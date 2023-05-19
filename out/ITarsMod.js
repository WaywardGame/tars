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
define(["require", "exports", "game/entity/IStats", "./core/ITarsOptions", "./modes/TreasureHunter"], function (require, exports, IStats_1, ITarsOptions_1, TreasureHunter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uiConfigurableModeOptions = exports.uiConfigurableGlobalOptions = exports.TarsOptionSectionType = exports.TarsTranslation = exports.TarsUiSaveDataKey = exports.getTarsTranslation = exports.setTarsMod = exports.getTarsMod = exports.TARS_ID = void 0;
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
    var TarsUiSaveDataKey;
    (function (TarsUiSaveDataKey) {
        TarsUiSaveDataKey[TarsUiSaveDataKey["DialogsOpened"] = 0] = "DialogsOpened";
        TarsUiSaveDataKey[TarsUiSaveDataKey["ActivePanelId"] = 1] = "ActivePanelId";
        TarsUiSaveDataKey[TarsUiSaveDataKey["AcquireItemDropdown"] = 2] = "AcquireItemDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["BuildDoodadDropdown"] = 3] = "BuildDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToIslandDropdown"] = 4] = "MoveToIslandDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToTerrainDropdown"] = 5] = "MoveToTerrainDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToDoodadDropdown"] = 6] = "MoveToDoodadDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToCreatureDropdown"] = 7] = "MoveToCreatureDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToPlayerDropdown"] = 8] = "MoveToPlayerDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["MoveToNPCTypeDropdown"] = 9] = "MoveToNPCTypeDropdown";
        TarsUiSaveDataKey[TarsUiSaveDataKey["TameCreatureDropdown"] = 10] = "TameCreatureDropdown";
    })(TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = TarsUiSaveDataKey = {}));
    var TarsTranslation;
    (function (TarsTranslation) {
        TarsTranslation[TarsTranslation["Name"] = 0] = "Name";
        TarsTranslation[TarsTranslation["NpcName"] = 1] = "NpcName";
        TarsTranslation[TarsTranslation["DialogTitleMain"] = 2] = "DialogTitleMain";
        TarsTranslation[TarsTranslation["DialogStatusNavigatingInitializing"] = 3] = "DialogStatusNavigatingInitializing";
        TarsTranslation[TarsTranslation["DialogPanelGeneral"] = 4] = "DialogPanelGeneral";
        TarsTranslation[TarsTranslation["DialogPanelNPCs"] = 5] = "DialogPanelNPCs";
        TarsTranslation[TarsTranslation["DialogPanelViewport"] = 6] = "DialogPanelViewport";
        TarsTranslation[TarsTranslation["DialogPanelTasks"] = 7] = "DialogPanelTasks";
        TarsTranslation[TarsTranslation["DialogPanelData"] = 8] = "DialogPanelData";
        TarsTranslation[TarsTranslation["DialogPanelMoveTo"] = 9] = "DialogPanelMoveTo";
        TarsTranslation[TarsTranslation["DialogPanelGlobalOptions"] = 10] = "DialogPanelGlobalOptions";
        TarsTranslation[TarsTranslation["DialogPanelModeOptions"] = 11] = "DialogPanelModeOptions";
        TarsTranslation[TarsTranslation["DialogButtonSimple"] = 12] = "DialogButtonSimple";
        TarsTranslation[TarsTranslation["DialogButtonSimpleTooltip"] = 13] = "DialogButtonSimpleTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAccurate"] = 14] = "DialogButtonAccurate";
        TarsTranslation[TarsTranslation["DialogButtonAccurateTooltip"] = 15] = "DialogButtonAccurateTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItems"] = 16] = "DialogButtonAllowProtectedItems";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsTooltip"] = 17] = "DialogButtonAllowProtectedItemsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsWithBreakCheck"] = 18] = "DialogButtonAllowProtectedItemsWithBreakCheck";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsWithBreakCheckTooltip"] = 19] = "DialogButtonAllowProtectedItemsWithBreakCheckTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAquireItem"] = 20] = "DialogButtonAquireItem";
        TarsTranslation[TarsTranslation["DialogButtonAquireItemTooltip"] = 21] = "DialogButtonAquireItemTooltip";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodad"] = 22] = "DialogButtonBuildDoodad";
        TarsTranslation[TarsTranslation["DialogButtonBuildDoodadTooltip"] = 23] = "DialogButtonBuildDoodadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDebugLogging"] = 24] = "DialogButtonDebugLogging";
        TarsTranslation[TarsTranslation["DialogButtonDebugLoggingTooltip"] = 25] = "DialogButtonDebugLoggingTooltip";
        TarsTranslation[TarsTranslation["DialogButtonNavigationOverlays"] = 26] = "DialogButtonNavigationOverlays";
        TarsTranslation[TarsTranslation["DialogButtonNavigationOverlaysTooltip"] = 27] = "DialogButtonNavigationOverlaysTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItems"] = 28] = "DialogButtonDisallowProtectedItems";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItemsTooltip"] = 29] = "DialogButtonDisallowProtectedItemsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsForEquipment"] = 30] = "DialogButtonAllowProtectedItemsForEquipment";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsForEquipmentTooltip"] = 31] = "DialogButtonAllowProtectedItemsForEquipmentTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasure"] = 32] = "DialogButtonDiscoverAndUnlockTreasure";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasureTooltip"] = 33] = "DialogButtonDiscoverAndUnlockTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 34] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonRename"] = 35] = "DialogButtonRename";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 36] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 37] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonFreeze"] = 38] = "DialogButtonFreeze";
        TarsTranslation[TarsTranslation["DialogButtonFreezeTooltip"] = 39] = "DialogButtonFreezeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizen"] = 40] = "DialogButtonGoodCitizen";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizenTooltip"] = 41] = "DialogButtonGoodCitizenTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGardenerOnlyEdiblePlants"] = 42] = "DialogButtonGardenerOnlyEdiblePlants";
        TarsTranslation[TarsTranslation["DialogButtonGardenerOnlyEdiblePlantsTooltip"] = 43] = "DialogButtonGardenerOnlyEdiblePlantsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHands"] = 44] = "DialogButtonHarvesterOnlyUseHands";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHandsTooltip"] = 45] = "DialogButtonHarvesterOnlyUseHandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasure"] = 46] = "DialogButtonObtainTreasure";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasureTooltip"] = 47] = "DialogButtonObtainTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasure"] = 48] = "DialogButtonOnlyDiscoverTreasure";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasureTooltip"] = 49] = "DialogButtonOnlyDiscoverTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonPrecognition"] = 50] = "DialogButtonPrecognition";
        TarsTranslation[TarsTranslation["DialogButtonPrecognitionTooltip"] = 51] = "DialogButtonPrecognitionTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 52] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 53] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowCaves"] = 54] = "DialogButtonAllowCaves";
        TarsTranslation[TarsTranslation["DialogButtonAllowCavesTooltip"] = 55] = "DialogButtonAllowCavesTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLockInventory"] = 56] = "DialogButtonLockInventory";
        TarsTranslation[TarsTranslation["DialogButtonLockInventoryTooltip"] = 57] = "DialogButtonLockInventoryTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLockEquipment"] = 58] = "DialogButtonLockEquipment";
        TarsTranslation[TarsTranslation["DialogButtonLockEquipmentTooltip"] = 59] = "DialogButtonLockEquipmentTooltip";
        TarsTranslation[TarsTranslation["DialogButtonReadBooks"] = 60] = "DialogButtonReadBooks";
        TarsTranslation[TarsTranslation["DialogButtonReadBooksTooltip"] = 61] = "DialogButtonReadBooksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonClearSwamps"] = 62] = "DialogButtonClearSwamps";
        TarsTranslation[TarsTranslation["DialogButtonClearSwampsTooltip"] = 63] = "DialogButtonClearSwampsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBase"] = 64] = "DialogButtonOrganizeBase";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBaseTooltip"] = 65] = "DialogButtonOrganizeBaseTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacks"] = 66] = "DialogButtonAllowBackpacks";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacksTooltip"] = 67] = "DialogButtonAllowBackpacksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficulty"] = 68] = "DialogButtonMaintainLowDifficulty";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficultyTooltip"] = 69] = "DialogButtonMaintainLowDifficultyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 70] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 71] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 72] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 73] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 74] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 75] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 76] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 77] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPC"] = 78] = "DialogButtonSpawnNPC";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPCTooltip"] = 79] = "DialogButtonSpawnNPCTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLoadTooltip"] = 80] = "DialogButtonLoadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonRenameTooltip"] = 81] = "DialogButtonRenameTooltip";
        TarsTranslation[TarsTranslation["DialogButtonConfigurationTooltip"] = 82] = "DialogButtonConfigurationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeleteTooltip"] = 83] = "DialogButtonDeleteTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSaveData"] = 84] = "DialogButtonSaveData";
        TarsTranslation[TarsTranslation["DialogButtonSaveDataTooltip"] = 85] = "DialogButtonSaveDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonImportData"] = 86] = "DialogButtonImportData";
        TarsTranslation[TarsTranslation["DialogButtonImportDataTooltip"] = 87] = "DialogButtonImportDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExportTooltip"] = 88] = "DialogButtonExportTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 89] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 90] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 91] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 92] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 93] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 94] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 95] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogButtonFollowPlayer"] = 96] = "DialogButtonFollowPlayer";
        TarsTranslation[TarsTranslation["DialogButtonFollowNPC"] = 97] = "DialogButtonFollowNPC";
        TarsTranslation[TarsTranslation["DialogLabel"] = 98] = "DialogLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 99] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 100] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 101] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 102] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 103] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 104] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 105] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 106] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 107] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 108] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 109] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 110] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 111] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 112] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 113] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 114] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 115] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 116] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 117] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 118] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 119] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogLabelPlanningAccuracy"] = 120] = "DialogLabelPlanningAccuracy";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 121] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 122] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 123] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 124] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 125] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 126] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 127] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 128] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 129] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 130] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 131] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 132] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeAngler"] = 133] = "DialogModeAngler";
        TarsTranslation[TarsTranslation["DialogModeAnglerTooltip"] = 134] = "DialogModeAnglerTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 135] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 136] = "DialogModeTreasureHunterTooltip";
    })(TarsTranslation || (exports.TarsTranslation = TarsTranslation = {}));
    var TarsOptionSectionType;
    (function (TarsOptionSectionType) {
        TarsOptionSectionType[TarsOptionSectionType["Checkbox"] = 0] = "Checkbox";
        TarsOptionSectionType[TarsOptionSectionType["Choice"] = 1] = "Choice";
        TarsOptionSectionType[TarsOptionSectionType["Slider"] = 2] = "Slider";
    })(TarsOptionSectionType || (exports.TarsOptionSectionType = TarsOptionSectionType = {}));
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
        {
            option: "allowBackpacks",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonAllowBackpacks,
            tooltip: TarsTranslation.DialogButtonAllowBackpacksTooltip,
        },
        TarsTranslation.DialogLabelItemProtection,
        {
            option: "lockEquipment",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonLockEquipment,
            tooltip: TarsTranslation.DialogButtonLockEquipmentTooltip,
        },
        {
            option: "useProtectedItems",
            type: TarsOptionSectionType.Choice,
            choices: [
                [TarsTranslation.DialogButtonDisallowProtectedItems, TarsTranslation.DialogButtonDisallowProtectedItemsTooltip, ITarsOptions_1.TarsUseProtectedItems.No],
                [TarsTranslation.DialogButtonAllowProtectedItems, TarsTranslation.DialogButtonAllowProtectedItemsTooltip, ITarsOptions_1.TarsUseProtectedItems.Yes],
                [TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheck, TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheckTooltip, ITarsOptions_1.TarsUseProtectedItems.YesWithBreakCheck],
            ],
        },
        {
            option: "useProtectedItemsForEquipment",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonAllowProtectedItemsForEquipment,
            tooltip: TarsTranslation.DialogButtonAllowProtectedItemsForEquipmentTooltip,
        },
        TarsTranslation.DialogLabelMultiplayer,
        {
            option: "goodCitizen",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonGoodCitizen,
            tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
        },
        TarsTranslation.DialogLabelPlanningAccuracy,
        {
            option: "planningAccuracy",
            type: TarsOptionSectionType.Choice,
            choices: [
                [TarsTranslation.DialogButtonSimple, TarsTranslation.DialogButtonSimpleTooltip, ITarsOptions_1.PlanningAccuracy.Simple],
                [TarsTranslation.DialogButtonAccurate, TarsTranslation.DialogButtonAccurateTooltip, ITarsOptions_1.PlanningAccuracy.Accurate],
            ],
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
            option: "navigationOverlays",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonNavigationOverlays,
            tooltip: TarsTranslation.DialogButtonNavigationOverlaysTooltip,
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
        TarsTranslation.DialogLabelAdvanced,
        {
            option: "quantumBurst",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonQuantumBurst,
            tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
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
        {
            option: "survivalMaintainLowDifficulty",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonMaintainLowDifficulty,
            tooltip: TarsTranslation.DialogButtonMaintainLowDifficultyTooltip,
        },
        TarsTranslation.DialogModeGardener,
        {
            option: "gardenerOnlyEdiblePlants",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonGardenerOnlyEdiblePlants,
            tooltip: TarsTranslation.DialogButtonGardenerOnlyEdiblePlantsTooltip,
        },
        TarsTranslation.DialogModeHarvester,
        {
            option: "harvesterOnlyUseHands",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWVVLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBZ0NELElBQVksaUJBWVg7SUFaRCxXQUFZLGlCQUFpQjtRQUN6QiwyRUFBYSxDQUFBO1FBQ2IsMkVBQWEsQ0FBQTtRQUNiLHVGQUFtQixDQUFBO1FBQ25CLHVGQUFtQixDQUFBO1FBQ25CLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLHlGQUFvQixDQUFBO1FBQ3BCLDZGQUFzQixDQUFBO1FBQ3RCLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLDBGQUFvQixDQUFBO0lBQ3hCLENBQUMsRUFaVyxpQkFBaUIsaUNBQWpCLGlCQUFpQixRQVk1QjtJQUdELElBQVksZUFrSlg7SUFsSkQsV0FBWSxlQUFlO1FBQ3ZCLHFEQUFJLENBQUE7UUFDSiwyREFBTyxDQUFBO1FBRVAsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDJFQUFlLENBQUE7UUFDZixt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