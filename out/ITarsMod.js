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
define(["require", "exports", "@wayward/game/game/entity/IStats", "./core/ITarsOptions", "./modes/TreasureHunter", "@wayward/game/game/deity/Deity"], function (require, exports, IStats_1, ITarsOptions_1, TreasureHunter_1, Deity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uiConfigurableModeOptions = exports.uiConfigurableGlobalOptions = exports.TarsOptionSectionType = exports.TarsTranslation = exports.TarsUiSaveDataKey = exports.TARS_ID = void 0;
    exports.getTarsMod = getTarsMod;
    exports.setTarsMod = setTarsMod;
    exports.getTarsTranslation = getTarsTranslation;
    exports.TARS_ID = "TARS";
    let tarsMod;
    function getTarsMod() {
        if (!tarsMod) {
            throw new Error("Invalid Tars instance");
        }
        return tarsMod;
    }
    function setTarsMod(instance) {
        tarsMod = instance;
    }
    function getTarsTranslation(translation) {
        return getTarsMod().getTranslation(translation);
    }
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
        TarsTranslation[TarsTranslation["DialogButtonStartWaterSources"] = 72] = "DialogButtonStartWaterSources";
        TarsTranslation[TarsTranslation["DialogButtonStartWaterSourcesTooltip"] = 73] = "DialogButtonStartWaterSourcesTooltip";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacks"] = 74] = "DialogButtonAllowBackpacks";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacksTooltip"] = 75] = "DialogButtonAllowBackpacksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficulty"] = 76] = "DialogButtonMaintainLowDifficulty";
        TarsTranslation[TarsTranslation["DialogButtonMaintainLowDifficultyTooltip"] = 77] = "DialogButtonMaintainLowDifficultyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 78] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 79] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 80] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 81] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 82] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 83] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 84] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 85] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPC"] = 86] = "DialogButtonSpawnNPC";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPCTooltip"] = 87] = "DialogButtonSpawnNPCTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLoadTooltip"] = 88] = "DialogButtonLoadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonRenameTooltip"] = 89] = "DialogButtonRenameTooltip";
        TarsTranslation[TarsTranslation["DialogButtonConfigurationTooltip"] = 90] = "DialogButtonConfigurationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeleteTooltip"] = 91] = "DialogButtonDeleteTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSaveData"] = 92] = "DialogButtonSaveData";
        TarsTranslation[TarsTranslation["DialogButtonSaveDataTooltip"] = 93] = "DialogButtonSaveDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonImportData"] = 94] = "DialogButtonImportData";
        TarsTranslation[TarsTranslation["DialogButtonImportDataTooltip"] = 95] = "DialogButtonImportDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExportTooltip"] = 96] = "DialogButtonExportTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 97] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 98] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 99] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 100] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 101] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 102] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 103] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogButtonFollowPlayer"] = 104] = "DialogButtonFollowPlayer";
        TarsTranslation[TarsTranslation["DialogButtonFollowNPC"] = 105] = "DialogButtonFollowNPC";
        TarsTranslation[TarsTranslation["DialogLabel"] = 106] = "DialogLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 107] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 108] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 109] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 110] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 111] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 112] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 113] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 114] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 115] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 116] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 117] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 118] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 119] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 120] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 121] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 122] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 123] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelDeity"] = 124] = "DialogLabelDeity";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 125] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 126] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 127] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 128] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogLabelPlanningAccuracy"] = 129] = "DialogLabelPlanningAccuracy";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 130] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 131] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 132] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 133] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 134] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 135] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 136] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 137] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 138] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 139] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 140] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 141] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeAngler"] = 142] = "DialogModeAngler";
        TarsTranslation[TarsTranslation["DialogModeAnglerTooltip"] = 143] = "DialogModeAnglerTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 144] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 145] = "DialogModeTreasureHunterTooltip";
        TarsTranslation[TarsTranslation["DialogButtonNone"] = 146] = "DialogButtonNone";
        TarsTranslation[TarsTranslation["DialogButtonDeityNoneTooltip"] = 147] = "DialogButtonDeityNoneTooltip";
        TarsTranslation[TarsTranslation["DialogButtonGood"] = 148] = "DialogButtonGood";
        TarsTranslation[TarsTranslation["DialogButtonDeityGoodTooltip"] = 149] = "DialogButtonDeityGoodTooltip";
        TarsTranslation[TarsTranslation["DialogButtonNeutral"] = 150] = "DialogButtonNeutral";
        TarsTranslation[TarsTranslation["DialogButtonDeityNeutralTooltip"] = 151] = "DialogButtonDeityNeutralTooltip";
        TarsTranslation[TarsTranslation["DialogButtonEvil"] = 152] = "DialogButtonEvil";
        TarsTranslation[TarsTranslation["DialogButtonDeityEvilTooltip"] = 153] = "DialogButtonDeityEvilTooltip";
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
        TarsTranslation.DialogLabelDeity,
        {
            option: "deity",
            type: TarsOptionSectionType.Choice,
            choices: [
                [TarsTranslation.DialogButtonNone, TarsTranslation.DialogButtonDeityNoneTooltip, null],
                [TarsTranslation.DialogButtonGood, TarsTranslation.DialogButtonDeityGoodTooltip, Deity_1.Deity.Good],
                [TarsTranslation.DialogButtonNeutral, TarsTranslation.DialogButtonDeityNeutralTooltip, Deity_1.Deity.Neutral],
                [TarsTranslation.DialogButtonEvil, TarsTranslation.DialogButtonDeityEvilTooltip, Deity_1.Deity.Evil],
            ],
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
            option: "survivalStartWaterSources",
            type: TarsOptionSectionType.Checkbox,
            title: TarsTranslation.DialogButtonStartWaterSources,
            tooltip: TarsTranslation.DialogButtonStartWaterSourcesTooltip,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQW9CSCxnQ0FNQztJQUVELGdDQUVDO0lBRUQsZ0RBRUM7SUFsQlksUUFBQSxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBRTlCLElBQUksT0FBNEIsQ0FBQztJQUVqQyxTQUFnQixVQUFVO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQWdCLFVBQVUsQ0FBQyxRQUE2QjtRQUN2RCxPQUFPLEdBQUcsUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxXQUFtRDtRQUNyRixPQUFPLFVBQVUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBZ0NELElBQVksaUJBWVg7SUFaRCxXQUFZLGlCQUFpQjtRQUM1QiwyRUFBYSxDQUFBO1FBQ2IsMkVBQWEsQ0FBQTtRQUNiLHVGQUFtQixDQUFBO1FBQ25CLHVGQUFtQixDQUFBO1FBQ25CLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLHlGQUFvQixDQUFBO1FBQ3BCLDZGQUFzQixDQUFBO1FBQ3RCLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLDBGQUFvQixDQUFBO0lBQ3JCLENBQUMsRUFaVyxpQkFBaUIsaUNBQWpCLGlCQUFpQixRQVk1QjtJQUdELElBQVksZUFtS1g7SUFuS0QsV0FBWSxlQUFlO1FBQzFCLHFEQUFJLENBQUE7UUFDSiwyREFBTyxDQUFBO1FBRVAsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDJFQUFlLENBQUE7UUFDZixtRkFBbUIsQ0FBQTtRQUNuQiw2RUFBZ0IsQ0FBQTtRQUNoQiwyRUFBZSxDQUFBO1FBQ2YsK0VBQWlCLENBQUE7UUFDakIsOEZBQXdCLENBQUE7UUFDeEIsMEZBQXNCLENBQUE7UUFFdEIsa0ZBQWtCLENBQUE7UUFDbEIsZ0dBQXlCLENBQUE7UUFDekIsc0ZBQW9CLENBQUE7UUFDcEIsb0dBQTJCLENBQUE7UUFDM0IsNEdBQStCLENBQUE7UUFDL0IsMEhBQXNDLENBQUE7UUFDdEMsd0lBQTZDLENBQUE7UUFDN0Msc0pBQW9ELENBQUE7UUFDcEQsMEZBQXNCLENBQUE7UUFDdEIsd0dBQTZCLENBQUE7UUFDN0IsNEZBQXVCLENBQUE7UUFDdkIsMEdBQThCLENBQUE7UUFDOUIsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0IsMEdBQThCLENBQUE7UUFDOUIsd0hBQXFDLENBQUE7UUFDckMsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0Isa0hBQWtDLENBQUE7UUFDbEMsZ0lBQXlDLENBQUE7UUFDekMsb0lBQTJDLENBQUE7UUFDM0Msa0pBQWtELENBQUE7UUFDbEQsd0hBQXFDLENBQUE7UUFDckMsc0lBQTRDLENBQUE7UUFDNUMsa0ZBQWtCLENBQUE7UUFDbEIsa0ZBQWtCLENBQUE7UUFDbEIsa0dBQTBCLENBQUE7UUFDMUIsZ0hBQWlDLENBQUE7UUFDakMsa0ZBQWtCLENBQUE7UUFDbEIsZ0dBQXlCLENBQUE7UUFDekIsNEZBQXVCLENBQUE7UUFDdkIsMEdBQThCLENBQUE7UUFDOUIsc0hBQW9DLENBQUE7UUFDcEMsb0lBQTJDLENBQUE7UUFDM0MsZ0hBQWlDLENBQUE7UUFDakMsOEhBQXdDLENBQUE7UUFDeEMsa0dBQTBCLENBQUE7UUFDMUIsZ0hBQWlDLENBQUE7UUFDakMsOEdBQWdDLENBQUE7UUFDaEMsNEhBQXVDLENBQUE7UUFDdkMsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0IsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0IsZ0hBQWlDLENBQUE7UUFDakMsOEhBQXdDLENBQUE7UUFDeEMsMEhBQXNDLENBQUE7UUFDdEMsd0lBQTZDLENBQUE7UUFDN0MsMEZBQXNCLENBQUE7UUFDdEIsd0dBQTZCLENBQUE7UUFDN0IsZ0dBQXlCLENBQUE7UUFDekIsOEdBQWdDLENBQUE7UUFDaEMsZ0dBQXlCLENBQUE7UUFDekIsOEdBQWdDLENBQUE7UUFDaEMsd0ZBQXFCLENBQUE7UUFDckIsc0dBQTRCLENBQUE7UUFDNUIsNEZBQXVCLENBQUE7UUFDdkIsMEdBQThCLENBQUE7UUFDOUIsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0Isd0dBQTZCLENBQUE7UUFDN0Isc0hBQW9DLENBQUE7UUFDcEMsa0dBQTBCLENBQUE7UUFDMUIsZ0hBQWlDLENBQUE7UUFDakMsZ0hBQWlDLENBQUE7UUFDakMsOEhBQXdDLENBQUE7UUFDeEMsMEdBQThCLENBQUE7UUFDOUIsd0hBQXFDLENBQUE7UUFDckMsNEZBQXVCLENBQUE7UUFDdkIsMEdBQThCLENBQUE7UUFDOUIsOEZBQXdCLENBQUE7UUFDeEIsNEdBQStCLENBQUE7UUFDL0IsMEdBQThCLENBQUE7UUFDOUIsd0hBQXFDLENBQUE7UUFDckMsc0ZBQW9CLENBQUE7UUFDcEIsb0dBQTJCLENBQUE7UUFDM0IsNEZBQXVCLENBQUE7UUFDdkIsZ0dBQXlCLENBQUE7UUFDekIsOEdBQWdDLENBQUE7UUFDaEMsZ0dBQXlCLENBQUE7UUFDekIsc0ZBQW9CLENBQUE7UUFDcEIsb0dBQTJCLENBQUE7UUFDM0IsMEZBQXNCLENBQUE7UUFDdEIsd0dBQTZCLENBQUE7UUFDN0IsZ0dBQXlCLENBQUE7UUFFekIsMEZBQXNCLENBQUE7UUFDdEIsOEZBQXdCLENBQUE7UUFDeEIsOEZBQXdCLENBQUE7UUFDeEIseUZBQXFCLENBQUE7UUFDckIsbUdBQTBCLENBQUE7UUFDMUIsK0ZBQXdCLENBQUE7UUFDeEIsaUdBQXlCLENBQUE7UUFDekIsK0ZBQXdCLENBQUE7UUFDeEIseUZBQXFCLENB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