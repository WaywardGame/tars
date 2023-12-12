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
import type { Events } from "@wayward/utilities/event/EventEmitter";
import type { IslandId } from "@wayward/game/game/island/IIsland";
import type Translation from "@wayward/game/language/Translation";
import type Mod from "@wayward/game/mod/Mod";
import { Reference } from "@wayward/game/game/reference/IReferenceManager";
import type { IContext } from "./core/context/IContext";
import { ITarsOptions } from "./core/ITarsOptions";
import type TarsMod from "./TarsMod";
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
    DialogButtonDisallowProtectedItems = 28,
    DialogButtonDisallowProtectedItemsTooltip = 29,
    DialogButtonAllowProtectedItemsForEquipment = 30,
    DialogButtonAllowProtectedItemsForEquipmentTooltip = 31,
    DialogButtonDiscoverAndUnlockTreasure = 32,
    DialogButtonDiscoverAndUnlockTreasureTooltip = 33,
    DialogButtonEnable = 34,
    DialogButtonRename = 35,
    DialogButtonExploreIslands = 36,
    DialogButtonExploreIslandsTooltip = 37,
    DialogButtonFreeze = 38,
    DialogButtonFreezeTooltip = 39,
    DialogButtonGoodCitizen = 40,
    DialogButtonGoodCitizenTooltip = 41,
    DialogButtonGardenerOnlyEdiblePlants = 42,
    DialogButtonGardenerOnlyEdiblePlantsTooltip = 43,
    DialogButtonHarvesterOnlyUseHands = 44,
    DialogButtonHarvesterOnlyUseHandsTooltip = 45,
    DialogButtonObtainTreasure = 46,
    DialogButtonObtainTreasureTooltip = 47,
    DialogButtonOnlyDiscoverTreasure = 48,
    DialogButtonOnlyDiscoverTreasureTooltip = 49,
    DialogButtonPrecognition = 50,
    DialogButtonPrecognitionTooltip = 51,
    DialogButtonQuantumBurst = 52,
    DialogButtonQuantumBurstTooltip = 53,
    DialogButtonLimitGroundItemSearch = 54,
    DialogButtonLimitGroundItemSearchTooltip = 55,
    DialogButtonLimitDisassembleItemSearch = 56,
    DialogButtonLimitDisassembleItemSearchTooltip = 57,
    DialogButtonAllowCaves = 58,
    DialogButtonAllowCavesTooltip = 59,
    DialogButtonLockInventory = 60,
    DialogButtonLockInventoryTooltip = 61,
    DialogButtonLockEquipment = 62,
    DialogButtonLockEquipmentTooltip = 63,
    DialogButtonReadBooks = 64,
    DialogButtonReadBooksTooltip = 65,
    DialogButtonClearSwamps = 66,
    DialogButtonClearSwampsTooltip = 67,
    DialogButtonOrganizeBase = 68,
    DialogButtonOrganizeBaseTooltip = 69,
    DialogButtonAllowBackpacks = 70,
    DialogButtonAllowBackpacksTooltip = 71,
    DialogButtonMaintainLowDifficulty = 72,
    DialogButtonMaintainLowDifficultyTooltip = 73,
    DialogButtonSailToCivilization = 74,
    DialogButtonSailToCivilizationTooltip = 75,
    DialogButtonStayHealthy = 76,
    DialogButtonStayHealthyTooltip = 77,
    DialogButtonTameCreature = 78,
    DialogButtonTameCreatureTooltip = 79,
    DialogButtonUseOrbsOfInfluence = 80,
    DialogButtonUseOrbsOfInfluenceTooltip = 81,
    DialogButtonSpawnNPC = 82,
    DialogButtonSpawnNPCTooltip = 83,
    DialogButtonLoadTooltip = 84,
    DialogButtonRenameTooltip = 85,
    DialogButtonConfigurationTooltip = 86,
    DialogButtonDeleteTooltip = 87,
    DialogButtonSaveData = 88,
    DialogButtonSaveDataTooltip = 89,
    DialogButtonImportData = 90,
    DialogButtonImportDataTooltip = 91,
    DialogButtonExportTooltip = 92,
    DialogButtonMoveToBase = 93,
    DialogButtonMoveToDoodad = 94,
    DialogButtonMoveToIsland = 95,
    DialogButtonMoveToNPC = 96,
    DialogButtonMoveToCreature = 97,
    DialogButtonMoveToPlayer = 98,
    DialogButtonMoveToTerrain = 99,
    DialogButtonFollowPlayer = 100,
    DialogButtonFollowNPC = 101,
    DialogLabel = 102,
    DialogRangeRecoverHealthThreshold = 103,
    DialogRangeRecoverHealthThresholdTooltip = 104,
    DialogRangeRecoverStaminaThreshold = 105,
    DialogRangeRecoverStaminaThresholdTooltip = 106,
    DialogRangeRecoverHungerThreshold = 107,
    DialogRangeRecoverHungerThresholdTooltip = 108,
    DialogRangeRecoverThirstThreshold = 109,
    DialogRangeRecoverThirstThresholdTooltip = 110,
    DialogLabelAdvanced = 111,
    DialogLabelCreature = 112,
    DialogLabelDeveloper = 113,
    DialogLabelDoodad = 114,
    DialogLabelGeneral = 115,
    DialogLabelIsland = 116,
    DialogLabelItem = 117,
    DialogLabelItemProtection = 118,
    DialogLabelMultiplayer = 119,
    DialogLabelNPC = 120,
    DialogLabelPlayer = 121,
    DialogLabelRecoverThresholds = 122,
    DialogLabelTerrain = 123,
    DialogLabelPlanningAccuracy = 124,
    DialogModeGardener = 125,
    DialogModeGardenerTooltip = 126,
    DialogModeHarvester = 127,
    DialogModeHarvesterTooltip = 128,
    DialogModeQuest = 129,
    DialogModeQuestTooltip = 130,
    DialogModeSurvival = 131,
    DialogModeSurvivalTooltip = 132,
    DialogModeTerminator = 133,
    DialogModeTerminatorTooltip = 134,
    DialogModeTidyUp = 135,
    DialogModeTidyUpTooltip = 136,
    DialogModeAngler = 137,
    DialogModeAnglerTooltip = 138,
    DialogModeTreasureHunter = 139,
    DialogModeTreasureHunterTooltip = 140
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
