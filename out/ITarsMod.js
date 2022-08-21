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
    })(TarsUiSaveDataKey = exports.TarsUiSaveDataKey || (exports.TarsUiSaveDataKey = {}));
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
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 66] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 67] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 68] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 69] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 70] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 71] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 72] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 73] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPC"] = 74] = "DialogButtonSpawnNPC";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPCTooltip"] = 75] = "DialogButtonSpawnNPCTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLoadTooltip"] = 76] = "DialogButtonLoadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonRenameTooltip"] = 77] = "DialogButtonRenameTooltip";
        TarsTranslation[TarsTranslation["DialogButtonConfigurationTooltip"] = 78] = "DialogButtonConfigurationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeleteTooltip"] = 79] = "DialogButtonDeleteTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSaveData"] = 80] = "DialogButtonSaveData";
        TarsTranslation[TarsTranslation["DialogButtonSaveDataTooltip"] = 81] = "DialogButtonSaveDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonImportData"] = 82] = "DialogButtonImportData";
        TarsTranslation[TarsTranslation["DialogButtonImportDataTooltip"] = 83] = "DialogButtonImportDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExportTooltip"] = 84] = "DialogButtonExportTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 85] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 86] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 87] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 88] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 89] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 90] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 91] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogLabel"] = 92] = "DialogLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 93] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 94] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 95] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 96] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 97] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 98] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 99] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 100] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 101] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 102] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 103] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 104] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 105] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 106] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 107] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 108] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 109] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 110] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 111] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 112] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 113] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogLabelPlanningAccuracy"] = 114] = "DialogLabelPlanningAccuracy";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 115] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 116] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 117] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 118] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 119] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 120] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 121] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 122] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 123] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 124] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 125] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 126] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 127] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 128] = "DialogModeTreasureHunterTooltip";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVlhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBZ0IsZUFBZSxDQUE0QixHQUFNO1FBQzdELE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFGRCwwQ0FFQztJQTZCRCxJQUFZLGlCQVlYO0lBWkQsV0FBWSxpQkFBaUI7UUFDekIsMkVBQWEsQ0FBQTtRQUNiLDJFQUFhLENBQUE7UUFDYix1RkFBbUIsQ0FBQTtRQUNuQix1RkFBbUIsQ0FBQTtRQUNuQix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQix5RkFBb0IsQ0FBQTtRQUNwQiw2RkFBc0IsQ0FBQTtRQUN0Qix5RkFBb0IsQ0FBQTtRQUNwQiwyRkFBcUIsQ0FBQTtRQUNyQiwwRkFBb0IsQ0FBQTtJQUN4QixDQUFDLEVBWlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFZNUI7SUFHRCxJQUFZLGVBMElYO0lBMUlELFdBQVksZUFBZTtRQUN2QixxREFBSSxDQUFBO1FBQ0osMkRBQU8sQ0FBQTtRQUVQLDJFQUFlLENBQUE7UUFFZixpSEFBa0MsQ0FBQTtRQUVsQyxpRkFBa0IsQ0FBQTtRQUNsQiwyRUFBZSxDQUFBO1FBQ2YsbUZBQW1CLENBQUE7UUFDbkIsNkVBQWdCLENBQUE7UUFDaEIsMkVBQWUsQ0FBQTtRQUNmLCtFQUFpQixDQUFBO1FBQ2pCLDhGQUF3QixDQUFBO1FBQ3hCLDBGQUFzQixDQUFBO1FBRXRCLGtGQUFrQixDQUFBO1FBQ2xCLGdHQUF5QixDQUFBO1FBQ3pCLHNGQUFvQixDQUFBO1FBQ3BCLG9HQUEyQixDQUFBO1FBQzNCLDRHQUErQixDQUFBO1FBQy9CLDBIQUFzQyxDQUFBO1FBQ3RDLHdJQUE2QyxDQUFBO1FBQzdDLHNKQUFvRCxDQUFBO1FBQ3BELDBGQUFzQixDQUFBO1FBQ3RCLHdHQUE2QixDQUFBO1FBQzdCLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBQy9CLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLGtIQUFrQyxDQUFBO1FBQ2xDLGdJQUF5QyxDQUFBO1FBQ3pDLG9JQUEyQyxDQUFBO1FBQzNDLGtKQUFrRCxDQUFBO1FBQ2xELHdIQUFxQyxDQUFBO1FBQ3JDLHNJQUE0QyxDQUFBO1FBQzVDLGtGQUFrQixDQUFBO1FBQ2xCLGtGQUFrQixDQUFBO1FBQ2xCLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLGtGQUFrQixDQUFBO1FBQ2xCLGdHQUF5QixDQUFBO1FBQ3pCLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLHNIQUFvQyxDQUFBO1FBQ3BDLG9JQUEyQyxDQUFBO1FBQzNDLGdIQUFpQyxDQUFBO1FBQ2pDLDhIQUF3QyxDQUFBO1FBQ3hDLGtHQUEwQixDQUFBO1FBQzFCLGdIQUFpQyxDQUFBO1FBQ2pDLDhHQUFnQyxDQUFBO1FBQ2hDLDRIQUF1QyxDQUFBO1FBQ3ZDLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBQy9CLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBQy9CLDBGQUFzQixDQUFBO1FBQ3RCLHdHQUE2QixDQUFBO1FBQzdCLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLHdGQUFxQixDQUFBO1FBQ3JCLHNHQUE0QixDQUFBO1FBQzVCLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBQy9CLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLDRGQUF1QixDQUFBO1FBQ3ZCLDBHQUE4QixDQUFBO1FBQzlCLDhGQUF3QixDQUFBO1FBQ3hCLDRHQUErQixDQUFBO1FBQy9CLDBHQUE4QixDQUFBO1FBQzlCLHdIQUFxQyxDQUFBO1FBQ3JDLHNGQUFvQixDQUFBO1FBQ3BCLG9HQUEyQixDQUFBO1FBQzNCLDRGQUF1QixDQUFBO1FBQ3ZCLGdHQUF5QixDQUFBO1FBQ3pCLDhHQUFnQyxDQUFBO1FBQ2hDLGdHQUF5QixDQUFBO1FBQ3pCLHNGQUFvQixDQUFBO1FBQ3BCLG9HQUEyQixDQUFBO1FBQzNCLDBGQUFzQixDQUFBO1FBQ3RCLHdHQUE2QixDQUFBO1FBQzdCLGdHQUF5QixDQUFBO1FBRXpCLDBGQUFzQixDQUFBO1FBQ3RCLDhGQUF3QixDQUFBO1FBQ3hCLDhGQUF3QixDQUFBO1FBQ3hCLHdGQUFxQixDQUFBO1FBQ3JCLGtHQUEwQixDQUFBO1FBQzFCLDhGQUF3QixDQUFBO1FBQ3hCLGdHQUF5QixDQUFBO1FBRXpCLG9FQUFXLENBQUE7UUFDWCxnSEFBaUMsQ0FBQTtRQUNqQyw4SEFBd0MsQ0FBQTtRQUN4QyxrSEFBa0MsQ0FBQTtRQUNsQyxnSUFBeUMsQ0FBQTtRQUN6QyxnSEFBaUMsQ0FBQTtRQUNqQyw4SEFBd0MsQ0FBQTtRQUN4QyxnSEFBaUMsQ0FBQTtRQUNqQywrSEFBd0MsQ0FBQTtRQUV4QyxxRkFBbUIsQ0FBQTtRQUNuQixxRkFBbUIsQ0FBQTtRQUNuQix1RkFBb0IsQ0FBQTtRQUNwQixpRkFBaUIsQ0FBQTtRQUNqQixtRkFBa0IsQ0FBQTtRQUNsQixpRkFBaUIsQ0FBQTtRQUNqQiw2RUFBZSxDQUFBO1FBQ2YsaUdBQXlCLENBQUE7UUFDekIsMkZBQXNCLENBQUE7UUFDdEIsMkVBQWMsQ0FBQTtRQUNkLGlGQUFpQixDQUFBO1FBQ2pCLHVHQUE0QixDQUFBO1FBQzVCLG1GQUFrQixDQUFBO1FBQ2xCLHFHQUEyQixDQUFBO1FBRTNCLG1GQUFrQixDQUFBO1FBQ2xCLGlHQUF5QixDQUFBO1FBQ3pCLHFGQUFtQixDQUFBO1FBQ25CLG1HQUEwQixDQUFBO1FBQzFCLDZFQUFlLENBQUE7UUFDZiwyRkFBc0IsQ0FBQTtRQUN0QixtRkFBa0IsQ0FBQTtRQUNsQixpR0FBeUIsQ0FBQTtRQUN6Qix1RkFBb0IsQ0FBQTtRQUNwQixxR0FBMkIsQ0FBQTtRQUMzQiwrRUFBZ0IsQ0FBQTtRQUNoQiw2RkFBdUIsQ0FBQTtRQUN2QiwrRkFBd0IsQ0FBQTtRQUN4Qiw2R0FBK0IsQ0FBQTtJQUNuQyxDQUFDLEVBMUlXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBMEkxQjtJQUVELElBQVkscUJBSVg7SUFKRCxXQUFZLHFCQUFxQjtRQUM3Qix5RUFBUSxDQUFBO1FBQ1IscUVBQU0sQ0FBQTtRQUNOLHFFQUFNLENBQUE7SUFDVixDQUFDLEVBSlcscUJBQXFCLEdBQXJCLDZCQUFxQixLQUFyQiw2QkFBcUIsUUFJaEM7SUFnQ1ksUUFBQSwyQkFBMkIsR0FBMkQ7UUFDL0YsZUFBZSxDQUFDLGtCQUFrQjtRQUNsQztZQUNJLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsdUJBQXVCO1lBQzlDLE9BQU8sRUFBRSxlQUFlLENBQUMsOEJBQThCO1NBQzFEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsWUFBWTtZQUNwQixJQUFJLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUNwQyxLQUFLLEVBQUUsZUFBZSxDQUFDLHNCQUFzQjtZQUM3QyxPQUFPLEVBQUUsZUFBZSxDQUFDLDZCQUE2QjtTQUN6RDtRQUNELGVBQWUsQ0FBQyx5QkFBeUI7UUFPekM7WUFDSSxNQUFNLEVBQUUsZUFBZTtZQUN2QixJQUFJLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUNwQyxLQUFLLEVBQUUsZUFBZSxDQUFDLHlCQUF5QjtZQUNoRCxPQUFPLEVBQUUsZUFBZSxDQUFDLGdDQUFnQztTQUM1RDtRQUNEO1lBQ0ksTUFBTSxFQUFFLG1CQUFtQjtZQUMzQixJQUFJLEVBQUUscUJBQXFCLENBQUMsTUFBTTtZQUNsQyxPQUFPLEVBQUU7Z0JBQ0wsQ0FBQyxlQUFlLENBQUMsa0NBQWtDLEVBQUUsZUFBZSxDQUFDLHlDQUF5QyxFQUFFLG9DQUFxQixDQUFDLEVBQUUsQ0FBQztnQkFDekksQ0FBQyxlQUFlLENBQUMsK0JBQStCLEVBQUUsZUFBZSxDQUFDLHNDQUFzQyxFQUFFLG9DQUFxQixDQUFDLEdBQUcsQ0FBQztnQkFDcEksQ0FBQyxlQUFlLENBQUMsNkNBQTZDLEVBQUUsZUFBZSxDQUFDLG9EQUFvRCxFQUFFLG9DQUFxQixDQUFDLGlCQUFpQixDQUFDO2FBQ2pMO1NBQ0o7UUFDRDtZQUNJLE1BQU0sRUFBRSwrQkFBK0I7WUFDdkMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7WUFDcEMsS0FBSyxFQUFFLGVBQWUsQ0FBQywyQ0FBMkM7WUFDbEUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxrREFBa0Q7U0FDOUU7UUFDRCxlQUFlLENBQUMsc0JBQXNCO1FBQ3RDO1lBQ0ksTUFBTSxFQUFFLGFBQWE7WUFDckIsSUFBSSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7WUFDcEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyx1QkFBdUI7WUFDOUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyw4QkFBOEI7U0FDMUQ7UUFDRCxlQUFlLENBQUMsMkJBQTJCO1FBQzNDO1lBQ0ksTUFBTSxFQUFFLGtCQUFrQjtZQUMxQixJQUFJLEVBQUUscUJBQXFCLENBQUMsTUFBTTtZQUNsQyxPQUFPLEVBQUU7Z0JBQ0wsQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxDQUFDLHlCQUF5QixFQUFFLCtCQUFnQixDQUFDLE1BQU0sQ0FBQztnQkFDeEcsQ0FBQyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsZUFBZSxDQUFDLDJCQUEyQixFQUFFLCtCQUFnQixDQUFDLFFBQVEsQ0FBQzthQUNqSDtTQUNKO1FBQ0QsZUFBZSxDQUFDLG9CQUFvQjtRQUNwQztZQUNJLE1BQU0sRUFBRSxjQUFjO1lBQ3RCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsd0JBQXdCO1lBQy9DLE9BQU8sRUFBRSxlQUFlLENBQUMsK0JBQStCO1NBQzNEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsUUFBUTtZQUNoQixJQUFJLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUNwQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGtCQUFrQjtZQUN6QyxPQUFPLEVBQUUsZUFBZSxDQUFDLHlCQUF5QjtTQUNyRDtRQUNEO1lBQ0ksTUFBTSxFQUFFLG9CQUFvQjtZQUM1QixJQUFJLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUNwQyxLQUFLLEVBQUUsZUFBZSxDQUFDLDhCQUE4QjtZQUNyRCxPQUFPLEVBQUUsZUFBZSxDQUFDLHFDQUFxQztTQUNqRTtRQUNELGVBQWUsQ0FBQyw0QkFBNEI7UUFDNUM7WUFDSSxNQUFNLEVBQUUsd0JBQXdCO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2xDLEtBQUssRUFBRSxlQUFlLENBQUMsaUNBQWlDO1lBQ3hELE9BQU8sRUFBRSxlQUFlLENBQUMsd0NBQXdDO1lBQ2pFLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRzthQUN0RTtTQUNKO1FBQ0Q7WUFDSSxNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2xDLEtBQUssRUFBRSxlQUFlLENBQUMsa0NBQWtDO1lBQ3pELE9BQU8sRUFBRSxlQUFlLENBQUMseUNBQXlDO1lBQ2xFLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRzthQUN2RTtTQUNKO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsd0JBQXdCO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2xDLEtBQUssRUFBRSxlQUFlLENBQUMsaUNBQWlDO1lBQ3hELE9BQU8sRUFBRSxlQUFlLENBQUMsd0NBQXdDO1lBQ2pFLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRzthQUN0RTtTQUNKO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsd0JBQXdCO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2xDLEtBQUssRUFBRSxlQUFlLENBQUMsaUNBQWlDO1lBQ3hELE9BQU8sRUFBRSxlQUFlLENBQUMsd0NBQXdDO1lBQ2pFLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBVyxhQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRzthQUN0RTtTQUNKO1FBQ0QsZUFBZSxDQUFDLG1CQUFtQjtRQUNuQztZQUNJLE1BQU0sRUFBRSxjQUFjO1lBQ3RCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsd0JBQXdCO1lBQy9DLE9BQU8sRUFBRSxlQUFlLENBQUMsK0JBQStCO1NBQzNEO0tBQ0osQ0FBQztJQUVXLFFBQUEseUJBQXlCLEdBQTJEO1FBQzdGLGVBQWUsQ0FBQyxrQkFBa0I7UUFDbEM7WUFDSSxNQUFNLEVBQUUsd0JBQXdCO1lBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsMEJBQTBCO1lBQ2pELE9BQU8sRUFBRSxlQUFlLENBQUMsaUNBQWlDO1NBQzdEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsNEJBQTRCO1lBQ3BDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsOEJBQThCO1lBQ3JELE9BQU8sRUFBRSxlQUFlLENBQUMscUNBQXFDO1NBQ2pFO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsbUJBQW1CO1lBQzNCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMscUJBQXFCO1lBQzVDLE9BQU8sRUFBRSxlQUFlLENBQUMsNEJBQTRCO1NBQ3hEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUscUJBQXFCO1lBQzdCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsdUJBQXVCO1lBQzlDLE9BQU8sRUFBRSxlQUFlLENBQUMsOEJBQThCO1NBQzFEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsc0JBQXNCO1lBQzlCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsd0JBQXdCO1lBQy9DLE9BQU8sRUFBRSxlQUFlLENBQUMsK0JBQStCO1NBQzNEO1FBQ0QsZUFBZSxDQUFDLGtCQUFrQjtRQUNsQztZQUNJLE1BQU0sRUFBRSwwQkFBMEI7WUFDbEMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLFFBQVE7WUFDcEMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxvQ0FBb0M7WUFDM0QsT0FBTyxFQUFFLGVBQWUsQ0FBQywyQ0FBMkM7U0FDdkU7UUFDRCxlQUFlLENBQUMsbUJBQW1CO1FBQ25DO1lBQ0ksTUFBTSxFQUFFLHVCQUF1QjtZQUMvQixJQUFJLEVBQUUscUJBQXFCLENBQUMsUUFBUTtZQUNwQyxLQUFLLEVBQUUsZUFBZSxDQUFDLGlDQUFpQztZQUN4RCxPQUFPLEVBQUUsZUFBZSxDQUFDLHdDQUF3QztTQUNwRTtRQUNELGVBQWUsQ0FBQyx3QkFBd0I7UUFDeEM7WUFDSSxNQUFNLEVBQUUsNEJBQTRCO1lBQ3BDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxRQUFRO1lBQ3BDLEtBQUssRUFBRSxlQUFlLENBQUMsd0JBQXdCO1lBQy9DLE9BQU8sRUFBRSxlQUFlLENBQUMsK0JBQStCO1NBQzNEO1FBQ0Q7WUFDSSxNQUFNLEVBQUUsb0JBQW9CO1lBQzVCLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNO1lBQ2xDLE9BQU8sRUFBRTtnQkFDTCxDQUFDLGVBQWUsQ0FBQyxnQ0FBZ0MsRUFBRSxlQUFlLENBQUMsdUNBQXVDLEVBQUUsbUNBQWtCLENBQUMsb0JBQW9CLENBQUM7Z0JBQ3BKLENBQUMsZUFBZSxDQUFDLHFDQUFxQyxFQUFFLGVBQWUsQ0FBQyw0Q0FBNEMsRUFBRSxtQ0FBa0IsQ0FBQyx5QkFBeUIsQ0FBQztnQkFDbkssQ0FBQyxlQUFlLENBQUMsMEJBQTBCLEVBQUUsZUFBZSxDQUFDLGlDQUFpQyxFQUFFLG1DQUFrQixDQUFDLGNBQWMsQ0FBQzthQUNySTtTQUNKO0tBQ0osQ0FBQyJ9