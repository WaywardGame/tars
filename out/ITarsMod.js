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
define(["require", "exports", "@wayward/game/game/entity/IStats", "./core/ITarsOptions", "./modes/TreasureHunter"], function (require, exports, IStats_1, ITarsOptions_1, TreasureHunter_1) {
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
        TarsTranslation[TarsTranslation["DialogButtonPreventNotes"] = 28] = "DialogButtonPreventNotes";
        TarsTranslation[TarsTranslation["DialogButtonPreventNotesTooltip"] = 29] = "DialogButtonPreventNotesTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItems"] = 30] = "DialogButtonDisallowProtectedItems";
        TarsTranslation[TarsTranslation["DialogButtonDisallowProtectedItemsTooltip"] = 31] = "DialogButtonDisallowProtectedItemsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsForEquipment"] = 32] = "DialogButtonAllowProtectedItemsForEquipment";
        TarsTranslation[TarsTranslation["DialogButtonAllowProtectedItemsForEquipmentTooltip"] = 33] = "DialogButtonAllowProtectedItemsForEquipmentTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasure"] = 34] = "DialogButtonDiscoverAndUnlockTreasure";
        TarsTranslation[TarsTranslation["DialogButtonDiscoverAndUnlockTreasureTooltip"] = 35] = "DialogButtonDiscoverAndUnlockTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonEnable"] = 36] = "DialogButtonEnable";
        TarsTranslation[TarsTranslation["DialogButtonRename"] = 37] = "DialogButtonRename";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslands"] = 38] = "DialogButtonExploreIslands";
        TarsTranslation[TarsTranslation["DialogButtonExploreIslandsTooltip"] = 39] = "DialogButtonExploreIslandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonFreeze"] = 40] = "DialogButtonFreeze";
        TarsTranslation[TarsTranslation["DialogButtonFreezeTooltip"] = 41] = "DialogButtonFreezeTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizen"] = 42] = "DialogButtonGoodCitizen";
        TarsTranslation[TarsTranslation["DialogButtonGoodCitizenTooltip"] = 43] = "DialogButtonGoodCitizenTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGardenerOnlyEdiblePlants"] = 44] = "DialogButtonGardenerOnlyEdiblePlants";
        TarsTranslation[TarsTranslation["DialogButtonGardenerOnlyEdiblePlantsTooltip"] = 45] = "DialogButtonGardenerOnlyEdiblePlantsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHands"] = 46] = "DialogButtonHarvesterOnlyUseHands";
        TarsTranslation[TarsTranslation["DialogButtonHarvesterOnlyUseHandsTooltip"] = 47] = "DialogButtonHarvesterOnlyUseHandsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasure"] = 48] = "DialogButtonObtainTreasure";
        TarsTranslation[TarsTranslation["DialogButtonObtainTreasureTooltip"] = 49] = "DialogButtonObtainTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasure"] = 50] = "DialogButtonOnlyDiscoverTreasure";
        TarsTranslation[TarsTranslation["DialogButtonOnlyDiscoverTreasureTooltip"] = 51] = "DialogButtonOnlyDiscoverTreasureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonPrecognition"] = 52] = "DialogButtonPrecognition";
        TarsTranslation[TarsTranslation["DialogButtonPrecognitionTooltip"] = 53] = "DialogButtonPrecognitionTooltip";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurst"] = 54] = "DialogButtonQuantumBurst";
        TarsTranslation[TarsTranslation["DialogButtonQuantumBurstTooltip"] = 55] = "DialogButtonQuantumBurstTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLimitGroundItemSearch"] = 56] = "DialogButtonLimitGroundItemSearch";
        TarsTranslation[TarsTranslation["DialogButtonLimitGroundItemSearchTooltip"] = 57] = "DialogButtonLimitGroundItemSearchTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLimitDisassembleItemSearch"] = 58] = "DialogButtonLimitDisassembleItemSearch";
        TarsTranslation[TarsTranslation["DialogButtonLimitDisassembleItemSearchTooltip"] = 59] = "DialogButtonLimitDisassembleItemSearchTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowCaves"] = 60] = "DialogButtonAllowCaves";
        TarsTranslation[TarsTranslation["DialogButtonAllowCavesTooltip"] = 61] = "DialogButtonAllowCavesTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLockInventory"] = 62] = "DialogButtonLockInventory";
        TarsTranslation[TarsTranslation["DialogButtonLockInventoryTooltip"] = 63] = "DialogButtonLockInventoryTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLockEquipment"] = 64] = "DialogButtonLockEquipment";
        TarsTranslation[TarsTranslation["DialogButtonLockEquipmentTooltip"] = 65] = "DialogButtonLockEquipmentTooltip";
        TarsTranslation[TarsTranslation["DialogButtonReadBooks"] = 66] = "DialogButtonReadBooks";
        TarsTranslation[TarsTranslation["DialogButtonReadBooksTooltip"] = 67] = "DialogButtonReadBooksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonClearSwamps"] = 68] = "DialogButtonClearSwamps";
        TarsTranslation[TarsTranslation["DialogButtonClearSwampsTooltip"] = 69] = "DialogButtonClearSwampsTooltip";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBase"] = 70] = "DialogButtonOrganizeBase";
        TarsTranslation[TarsTranslation["DialogButtonOrganizeBaseTooltip"] = 71] = "DialogButtonOrganizeBaseTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacks"] = 72] = "DialogButtonAllowBackpacks";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacksTooltip"] = 73] = "DialogButtonAllowBackpacksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficulty"] = 74] = "DialogButtonMaintainLowDifficulty";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficultyTooltip"] = 75] = "DialogButtonMaintainLowDifficultyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 76] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 77] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 78] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 79] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 80] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 81] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 82] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 83] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPC"] = 84] = "DialogButtonSpawnNPC";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPCTooltip"] = 85] = "DialogButtonSpawnNPCTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLoadTooltip"] = 86] = "DialogButtonLoadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonRenameTooltip"] = 87] = "DialogButtonRenameTooltip";
        TarsTranslation[TarsTranslation["DialogButtonConfigurationTooltip"] = 88] = "DialogButtonConfigurationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeleteTooltip"] = 89] = "DialogButtonDeleteTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSaveData"] = 90] = "DialogButtonSaveData";
        TarsTranslation[TarsTranslation["DialogButtonSaveDataTooltip"] = 91] = "DialogButtonSaveDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonImportData"] = 92] = "DialogButtonImportData";
        TarsTranslation[TarsTranslation["DialogButtonImportDataTooltip"] = 93] = "DialogButtonImportDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExportTooltip"] = 94] = "DialogButtonExportTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 95] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 96] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 97] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 98] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 99] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 100] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 101] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogButtonFollowPlayer"] = 102] = "DialogButtonFollowPlayer";
        TarsTranslation[TarsTranslation["DialogButtonFollowNPC"] = 103] = "DialogButtonFollowNPC";
        TarsTranslation[TarsTranslation["DialogLabel"] = 104] = "DialogLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 105] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 106] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 107] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 108] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 109] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 110] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 111] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 112] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 113] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 114] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 115] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 116] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 117] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 118] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 119] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 120] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 121] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 122] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 123] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 124] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 125] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogLabelPlanningAccuracy"] = 126] = "DialogLabelPlanningAccuracy";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 127] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 128] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 129] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 130] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 131] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 132] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 133] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 134] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 135] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 136] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 137] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 138] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeAngler"] = 139] = "DialogModeAngler";
        TarsTranslation[TarsTranslation["DialogModeAnglerTooltip"] = 140] = "DialogModeAnglerTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 141] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 142] = "DialogModeTreasureHunterTooltip";
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
        {
            option: "preventNotes",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonPreventNotes,
            tooltip: TarsTranslation.DialogButtonPreventNotesTooltip,
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
        {
            option: "limitGroundItemSearch",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonLimitGroundItemSearch,
            tooltip: TarsTranslation.DialogButtonLimitGroundItemSearchTooltip,
        },
        {
            option: "limitDisassembleItemSearch",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonLimitDisassembleItemSearch,
            tooltip: TarsTranslation.DialogButtonLimitDisassembleItemSearchTooltip,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQWVVLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFORCxnQ0FNQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxRQUE2QjtRQUN2RCxPQUFPLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFGRCxnQ0FFQztJQUVELFNBQWdCLGtCQUFrQixDQUFDLFdBQW1EO1FBQ3JGLE9BQU8sVUFBVSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCxnREFFQztJQWdDRCxJQUFZLGlCQVlYO0lBWkQsV0FBWSxpQkFBaUI7UUFDNUIsMkVBQWEsQ0FBQTtRQUNiLDJFQUFhLENBQUE7UUFDYix1RkFBbUIsQ0FBQTtRQUNuQix1RkFBbUIsQ0FBQTtRQUNuQix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQix5RkFBb0IsQ0FBQTtRQUNwQiw2RkFBc0IsQ0FBQTtRQUN0Qix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQiwwRkFBb0IsQ0FBQTtJQUNyQixDQUFDLEVBWlcsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFZNUI7SUFHRCxJQUFZLGVBd0pYO0lBeEpELFdBQVksZUFBZTtRQUMxQixxREFBSSxDQUFBO1FBQ0osMkRBQU8sQ0FBQTtRQUVQLDJFQUFlLENBQUE7UUFFZixpSEFBa0MsQ0FBQTtRQUVsQyxpRkFBa0IsQ0FBQTtRQUNsQiwyRUFBZSxD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