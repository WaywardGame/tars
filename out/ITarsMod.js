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
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacks"] = 66] = "DialogButtonAllowBackpacks";
        TarsTranslation[TarsTranslation["DialogButtonAllowBackpacksTooltip"] = 67] = "DialogButtonAllowBackpacksTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilization"] = 68] = "DialogButtonSailToCivilization";
        TarsTranslation[TarsTranslation["DialogButtonSailToCivilizationTooltip"] = 69] = "DialogButtonSailToCivilizationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthy"] = 70] = "DialogButtonStayHealthy";
        TarsTranslation[TarsTranslation["DialogButtonStayHealthyTooltip"] = 71] = "DialogButtonStayHealthyTooltip";
        TarsTranslation[TarsTranslation["DialogButtonTameCreature"] = 72] = "DialogButtonTameCreature";
        TarsTranslation[TarsTranslation["DialogButtonTameCreatureTooltip"] = 73] = "DialogButtonTameCreatureTooltip";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluence"] = 74] = "DialogButtonUseOrbsOfInfluence";
        TarsTranslation[TarsTranslation["DialogButtonUseOrbsOfInfluenceTooltip"] = 75] = "DialogButtonUseOrbsOfInfluenceTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPC"] = 76] = "DialogButtonSpawnNPC";
        TarsTranslation[TarsTranslation["DialogButtonSpawnNPCTooltip"] = 77] = "DialogButtonSpawnNPCTooltip";
        TarsTranslation[TarsTranslation["DialogButtonLoadTooltip"] = 78] = "DialogButtonLoadTooltip";
        TarsTranslation[TarsTranslation["DialogButtonRenameTooltip"] = 79] = "DialogButtonRenameTooltip";
        TarsTranslation[TarsTranslation["DialogButtonConfigurationTooltip"] = 80] = "DialogButtonConfigurationTooltip";
        TarsTranslation[TarsTranslation["DialogButtonDeleteTooltip"] = 81] = "DialogButtonDeleteTooltip";
        TarsTranslation[TarsTranslation["DialogButtonSaveData"] = 82] = "DialogButtonSaveData";
        TarsTranslation[TarsTranslation["DialogButtonSaveDataTooltip"] = 83] = "DialogButtonSaveDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonImportData"] = 84] = "DialogButtonImportData";
        TarsTranslation[TarsTranslation["DialogButtonImportDataTooltip"] = 85] = "DialogButtonImportDataTooltip";
        TarsTranslation[TarsTranslation["DialogButtonExportTooltip"] = 86] = "DialogButtonExportTooltip";
        TarsTranslation[TarsTranslation["DialogButtonMoveToBase"] = 87] = "DialogButtonMoveToBase";
        TarsTranslation[TarsTranslation["DialogButtonMoveToDoodad"] = 88] = "DialogButtonMoveToDoodad";
        TarsTranslation[TarsTranslation["DialogButtonMoveToIsland"] = 89] = "DialogButtonMoveToIsland";
        TarsTranslation[TarsTranslation["DialogButtonMoveToNPC"] = 90] = "DialogButtonMoveToNPC";
        TarsTranslation[TarsTranslation["DialogButtonMoveToCreature"] = 91] = "DialogButtonMoveToCreature";
        TarsTranslation[TarsTranslation["DialogButtonMoveToPlayer"] = 92] = "DialogButtonMoveToPlayer";
        TarsTranslation[TarsTranslation["DialogButtonMoveToTerrain"] = 93] = "DialogButtonMoveToTerrain";
        TarsTranslation[TarsTranslation["DialogButtonFollowPlayer"] = 94] = "DialogButtonFollowPlayer";
        TarsTranslation[TarsTranslation["DialogButtonFollowNPC"] = 95] = "DialogButtonFollowNPC";
        TarsTranslation[TarsTranslation["DialogLabel"] = 96] = "DialogLabel";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThreshold"] = 97] = "DialogRangeRecoverHealthThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHealthThresholdTooltip"] = 98] = "DialogRangeRecoverHealthThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThreshold"] = 99] = "DialogRangeRecoverStaminaThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverStaminaThresholdTooltip"] = 100] = "DialogRangeRecoverStaminaThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThreshold"] = 101] = "DialogRangeRecoverHungerThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverHungerThresholdTooltip"] = 102] = "DialogRangeRecoverHungerThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThreshold"] = 103] = "DialogRangeRecoverThirstThreshold";
        TarsTranslation[TarsTranslation["DialogRangeRecoverThirstThresholdTooltip"] = 104] = "DialogRangeRecoverThirstThresholdTooltip";
        TarsTranslation[TarsTranslation["DialogLabelAdvanced"] = 105] = "DialogLabelAdvanced";
        TarsTranslation[TarsTranslation["DialogLabelCreature"] = 106] = "DialogLabelCreature";
        TarsTranslation[TarsTranslation["DialogLabelDeveloper"] = 107] = "DialogLabelDeveloper";
        TarsTranslation[TarsTranslation["DialogLabelDoodad"] = 108] = "DialogLabelDoodad";
        TarsTranslation[TarsTranslation["DialogLabelGeneral"] = 109] = "DialogLabelGeneral";
        TarsTranslation[TarsTranslation["DialogLabelIsland"] = 110] = "DialogLabelIsland";
        TarsTranslation[TarsTranslation["DialogLabelItem"] = 111] = "DialogLabelItem";
        TarsTranslation[TarsTranslation["DialogLabelItemProtection"] = 112] = "DialogLabelItemProtection";
        TarsTranslation[TarsTranslation["DialogLabelMultiplayer"] = 113] = "DialogLabelMultiplayer";
        TarsTranslation[TarsTranslation["DialogLabelNPC"] = 114] = "DialogLabelNPC";
        TarsTranslation[TarsTranslation["DialogLabelPlayer"] = 115] = "DialogLabelPlayer";
        TarsTranslation[TarsTranslation["DialogLabelRecoverThresholds"] = 116] = "DialogLabelRecoverThresholds";
        TarsTranslation[TarsTranslation["DialogLabelTerrain"] = 117] = "DialogLabelTerrain";
        TarsTranslation[TarsTranslation["DialogLabelPlanningAccuracy"] = 118] = "DialogLabelPlanningAccuracy";
        TarsTranslation[TarsTranslation["DialogModeGardener"] = 119] = "DialogModeGardener";
        TarsTranslation[TarsTranslation["DialogModeGardenerTooltip"] = 120] = "DialogModeGardenerTooltip";
        TarsTranslation[TarsTranslation["DialogModeHarvester"] = 121] = "DialogModeHarvester";
        TarsTranslation[TarsTranslation["DialogModeHarvesterTooltip"] = 122] = "DialogModeHarvesterTooltip";
        TarsTranslation[TarsTranslation["DialogModeQuest"] = 123] = "DialogModeQuest";
        TarsTranslation[TarsTranslation["DialogModeQuestTooltip"] = 124] = "DialogModeQuestTooltip";
        TarsTranslation[TarsTranslation["DialogModeSurvival"] = 125] = "DialogModeSurvival";
        TarsTranslation[TarsTranslation["DialogModeSurvivalTooltip"] = 126] = "DialogModeSurvivalTooltip";
        TarsTranslation[TarsTranslation["DialogModeTerminator"] = 127] = "DialogModeTerminator";
        TarsTranslation[TarsTranslation["DialogModeTerminatorTooltip"] = 128] = "DialogModeTerminatorTooltip";
        TarsTranslation[TarsTranslation["DialogModeTidyUp"] = 129] = "DialogModeTidyUp";
        TarsTranslation[TarsTranslation["DialogModeTidyUpTooltip"] = 130] = "DialogModeTidyUpTooltip";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunter"] = 131] = "DialogModeTreasureHunter";
        TarsTranslation[TarsTranslation["DialogModeTreasureHunterTooltip"] = 132] = "DialogModeTreasureHunterTooltip";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVRhcnNNb2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvSVRhcnNNb2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWFhLFFBQUEsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUU5QixJQUFJLE9BQTRCLENBQUM7SUFFakMsU0FBZ0IsVUFBVTtRQUN0QixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQU5ELGdDQU1DO0lBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQTZCO1FBQ3BELE9BQU8sR0FBRyxRQUFRLENBQUM7SUFDdkIsQ0FBQztJQUZELGdDQUVDO0lBRUQsU0FBZ0Isa0JBQWtCLENBQUMsV0FBbUQ7UUFDbEYsT0FBTyxVQUFVLEVBQUUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUZELGdEQUVDO0lBZ0NELElBQVksaUJBWVg7SUFaRCxXQUFZLGlCQUFpQjtRQUN6QiwyRUFBYSxDQUFBO1FBQ2IsMkVBQWEsQ0FBQTtRQUNiLHVGQUFtQixDQUFBO1FBQ25CLHVGQUFtQixDQUFBO1FBQ25CLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLHlGQUFvQixDQUFBO1FBQ3BCLDZGQUFzQixDQUFBO1FBQ3RCLHlGQUFvQixDQUFBO1FBQ3BCLDJGQUFxQixDQUFBO1FBQ3JCLDBGQUFvQixDQUFBO0lBQ3hCLENBQUMsRUFaVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQVk1QjtJQUdELElBQVksZUE4SVg7SUE5SUQsV0FBWSxlQUFlO1FBQ3ZCLHFEQUFJLENBQUE7UUFDSiwyREFBTyxDQUFBO1FBRVAsMkVBQWUsQ0FBQTtRQUVmLGlIQUFrQyxDQUFBO1FBRWxDLGlGQUFrQixDQUFBO1FBQ2xCLDJFQUFlLENBQUE7UUFDZixtRkFBbUIs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