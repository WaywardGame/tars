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
import type { IslandId } from "@wayward/game/game/island/IIsland";
import type Translation from "@wayward/game/language/Translation";
import type Mod from "@wayward/game/mod/Mod";
import type { Events } from "@wayward/utilities/event/EventEmitter";
import { Reference } from "@wayward/game/game/reference/IReferenceManager";
import type TarsMod from "./TarsMod";
import { ITarsOptions } from "./core/ITarsOptions";
import type { IContext } from "./core/context/IContext";
export declare const TARS_ID = "TARS";
export declare function getTarsMod(): TarsMod;
export declare function setTarsMod(instance: TarsMod | undefined): void;
export declare function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation;
export interface ITarsModEvents extends Events<Mod> {
    statusChange(): any;
    refreshTarsInstanceReferences(): any;
    changedGlobalDataSlots(): any;
}
export interface IGlobalSaveData {
    dataSlots: ISaveDataContainer[];
}
export interface ISaveDataContainer {
    name: string;
    version: string;
    saveData: ISaveData;
}
export interface ISaveData {
    enabled: boolean;
    configuredThresholds?: boolean;
    options: ITarsOptions;
    island: Record<IslandId, Record<string, any>>;
    ui: Partial<Record<TarsUiSaveDataKey, any>>;
    instanceIslandIds: Map<IslandId, Reference[]>;
}
export declare enum TarsUiSaveDataKey {
    DialogsOpened = 0,
    ActivePanelId = 1,
    AcquireItemDropdown = 2,
    BuildDoodadDropdown = 3,
    MoveToIslandDropdown = 4,
    MoveToTerrainDropdown = 5,
    MoveToDoodadDropdown = 6,
    MoveToCreatureDropdown = 7,
    MoveToPlayerDropdown = 8,
    MoveToNPCTypeDropdown = 9,
    TameCreatureDropdown = 10
}
export declare enum TarsTranslation {
    Name = 0,
    NpcName = 1,
    DialogTitleMain = 2,
    DialogStatusNavigatingInitializing = 3,
    DialogPanelGeneral = 4,
    DialogPanelNPCs = 5,
    DialogPanelViewport = 6,
    DialogPanelTasks = 7,
    DialogPanelData = 8,
    DialogPanelMoveTo = 9,
    DialogPanelGlobalOptions = 10,
    DialogPanelModeOptions = 11,
    DialogButtonSimple = 12,
    DialogButtonSimpleTooltip = 13,
    DialogButtonAccurate = 14,
    DialogButtonAccurateTooltip = 15,
    DialogButtonAllowProtectedItems = 16,
    DialogButtonAllowProtectedItemsTooltip = 17,
    DialogButtonAllowProtectedItemsWithBreakCheck = 18,
    DialogButtonAllowProtectedItemsWithBreakCheckTooltip = 19,
    DialogButtonAquireItem = 20,
    DialogButtonAquireItemTooltip = 21,
    DialogButtonBuildDoodad = 22,
    DialogButtonBuildDoodadTooltip = 23,
    DialogButtonDebugLogging = 24,
    DialogButtonDebugLoggingTooltip = 25,
    DialogButtonNavigationOverlays = 26,
    DialogButtonNavigationOverlaysTooltip = 27,
    DialogButtonPreventNotes = 28,
    DialogButtonPreventNotesTooltip = 29,
    DialogButtonDisallowProtectedItems = 30,
    DialogButtonDisallowProtectedItemsTooltip = 31,
    DialogButtonAllowProtectedItemsForEquipment = 32,
    DialogButtonAllowProtectedItemsForEquipmentTooltip = 33,
    DialogButtonDiscoverAndUnlockTreasure = 34,
    DialogButtonDiscoverAndUnlockTreasureTooltip = 35,
    DialogButtonEnable = 36,
    DialogButtonRename = 37,
    DialogButtonExploreIslands = 38,
    DialogButtonExploreIslandsTooltip = 39,
    DialogButtonFreeze = 40,
    DialogButtonFreezeTooltip = 41,
    DialogButtonGoodCitizen = 42,
    DialogButtonGoodCitizenTooltip = 43,
    DialogButtonGardenerOnlyEdiblePlants = 44,
    DialogButtonGardenerOnlyEdiblePlantsTooltip = 45,
    DialogButtonHarvesterOnlyUseHands = 46,
    DialogButtonHarvesterOnlyUseHandsTooltip = 47,
    DialogButtonObtainTreasure = 48,
    DialogButtonObtainTreasureTooltip = 49,
    DialogButtonOnlyDiscoverTreasure = 50,
    DialogButtonOnlyDiscoverTreasureTooltip = 51,
    DialogButtonPrecognition = 52,
    DialogButtonPrecognitionTooltip = 53,
    DialogButtonQuantumBurst = 54,
    DialogButtonQuantumBurstTooltip = 55,
    DialogButtonLimitGroundItemSearch = 56,
    DialogButtonLimitGroundItemSearchTooltip = 57,
    DialogButtonLimitDisassembleItemSearch = 58,
    DialogButtonLimitDisassembleItemSearchTooltip = 59,
    DialogButtonAllowCaves = 60,
    DialogButtonAllowCavesTooltip = 61,
    DialogButtonLockInventory = 62,
    DialogButtonLockInventoryTooltip = 63,
    DialogButtonLockEquipment = 64,
    DialogButtonLockEquipmentTooltip = 65,
    DialogButtonReadBooks = 66,
    DialogButtonReadBooksTooltip = 67,
    DialogButtonClearSwamps = 68,
    DialogButtonClearSwampsTooltip = 69,
    DialogButtonOrganizeBase = 70,
    DialogButtonOrganizeBaseTooltip = 71,
    DialogButtonStartWaterSources = 72,
    DialogButtonStartWaterSourcesTooltip = 73,
    DialogButtonAllowBackpacks = 74,
    DialogButtonAllowBackpacksTooltip = 75,
    DialogButtonMaintainLowDifficulty = 76,
    DialogButtonMaintainLowDifficultyTooltip = 77,
    DialogButtonSailToCivilization = 78,
    DialogButtonSailToCivilizationTooltip = 79,
    DialogButtonStayHealthy = 80,
    DialogButtonStayHealthyTooltip = 81,
    DialogButtonTameCreature = 82,
    DialogButtonTameCreatureTooltip = 83,
    DialogButtonUseOrbsOfInfluence = 84,
    DialogButtonUseOrbsOfInfluenceTooltip = 85,
    DialogButtonSpawnNPC = 86,
    DialogButtonSpawnNPCTooltip = 87,
    DialogButtonLoadTooltip = 88,
    DialogButtonRenameTooltip = 89,
    DialogButtonConfigurationTooltip = 90,
    DialogButtonDeleteTooltip = 91,
    DialogButtonSaveData = 92,
    DialogButtonSaveDataTooltip = 93,
    DialogButtonImportData = 94,
    DialogButtonImportDataTooltip = 95,
    DialogButtonExportTooltip = 96,
    DialogButtonMoveToBase = 97,
    DialogButtonMoveToDoodad = 98,
    DialogButtonMoveToIsland = 99,
    DialogButtonMoveToNPC = 100,
    DialogButtonMoveToCreature = 101,
    DialogButtonMoveToPlayer = 102,
    DialogButtonMoveToTerrain = 103,
    DialogButtonFollowPlayer = 104,
    DialogButtonFollowNPC = 105,
    DialogLabel = 106,
    DialogRangeRecoverHealthThreshold = 107,
    DialogRangeRecoverHealthThresholdTooltip = 108,
    DialogRangeRecoverStaminaThreshold = 109,
    DialogRangeRecoverStaminaThresholdTooltip = 110,
    DialogRangeRecoverHungerThreshold = 111,
    DialogRangeRecoverHungerThresholdTooltip = 112,
    DialogRangeRecoverThirstThreshold = 113,
    DialogRangeRecoverThirstThresholdTooltip = 114,
    DialogLabelAdvanced = 115,
    DialogLabelCreature = 116,
    DialogLabelDeveloper = 117,
    DialogLabelDoodad = 118,
    DialogLabelGeneral = 119,
    DialogLabelIsland = 120,
    DialogLabelItem = 121,
    DialogLabelItemProtection = 122,
    DialogLabelMultiplayer = 123,
    DialogLabelNPC = 124,
    DialogLabelPlayer = 125,
    DialogLabelRecoverThresholds = 126,
    DialogLabelTerrain = 127,
    DialogLabelPlanningAccuracy = 128,
    DialogModeGardener = 129,
    DialogModeGardenerTooltip = 130,
    DialogModeHarvester = 131,
    DialogModeHarvesterTooltip = 132,
    DialogModeQuest = 133,
    DialogModeQuestTooltip = 134,
    DialogModeSurvival = 135,
    DialogModeSurvivalTooltip = 136,
    DialogModeTerminator = 137,
    DialogModeTerminatorTooltip = 138,
    DialogModeTidyUp = 139,
    DialogModeTidyUpTooltip = 140,
    DialogModeAngler = 141,
    DialogModeAnglerTooltip = 142,
    DialogModeTreasureHunter = 143,
    DialogModeTreasureHunterTooltip = 144
}
export declare enum TarsOptionSectionType {
    Checkbox = 0,
    Choice = 1,
    Slider = 2
}
interface ITarsOptionSection {
    type: TarsOptionSectionType;
    option: keyof Omit<ITarsOptions, "mode">;
    isDisabled?: () => boolean;
}
export interface ITarsCheckboxOptionSection extends ITarsOptionSection {
    type: TarsOptionSectionType.Checkbox;
    title: TarsTranslation;
    tooltip: TarsTranslation;
}
export interface ITarsChoiceOptionSection extends ITarsOptionSection {
    type: TarsOptionSectionType.Choice;
    choices: Array<[TarsTranslation, TarsTranslation, any]>;
}
export interface ITarsSliderOptionSection extends ITarsOptionSection {
    type: TarsOptionSectionType.Slider;
    title: TarsTranslation;
    tooltip: TarsTranslation;
    slider: {
        min: number | ((context: IContext) => number);
        max: number | ((context: IContext) => number);
    };
}
export type TarsOptionSection = ITarsCheckboxOptionSection | ITarsChoiceOptionSection | ITarsSliderOptionSection;
export declare const uiConfigurableGlobalOptions: Array<TarsOptionSection | TarsTranslation | undefined>;
export declare const uiConfigurableModeOptions: Array<TarsOptionSection | TarsTranslation | undefined>;
export {};
