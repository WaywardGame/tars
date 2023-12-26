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
    DialogButtonAllowBackpacks = 72,
    DialogButtonAllowBackpacksTooltip = 73,
    DialogButtonMaintainLowDifficulty = 74,
    DialogButtonMaintainLowDifficultyTooltip = 75,
    DialogButtonSailToCivilization = 76,
    DialogButtonSailToCivilizationTooltip = 77,
    DialogButtonStayHealthy = 78,
    DialogButtonStayHealthyTooltip = 79,
    DialogButtonTameCreature = 80,
    DialogButtonTameCreatureTooltip = 81,
    DialogButtonUseOrbsOfInfluence = 82,
    DialogButtonUseOrbsOfInfluenceTooltip = 83,
    DialogButtonSpawnNPC = 84,
    DialogButtonSpawnNPCTooltip = 85,
    DialogButtonLoadTooltip = 86,
    DialogButtonRenameTooltip = 87,
    DialogButtonConfigurationTooltip = 88,
    DialogButtonDeleteTooltip = 89,
    DialogButtonSaveData = 90,
    DialogButtonSaveDataTooltip = 91,
    DialogButtonImportData = 92,
    DialogButtonImportDataTooltip = 93,
    DialogButtonExportTooltip = 94,
    DialogButtonMoveToBase = 95,
    DialogButtonMoveToDoodad = 96,
    DialogButtonMoveToIsland = 97,
    DialogButtonMoveToNPC = 98,
    DialogButtonMoveToCreature = 99,
    DialogButtonMoveToPlayer = 100,
    DialogButtonMoveToTerrain = 101,
    DialogButtonFollowPlayer = 102,
    DialogButtonFollowNPC = 103,
    DialogLabel = 104,
    DialogRangeRecoverHealthThreshold = 105,
    DialogRangeRecoverHealthThresholdTooltip = 106,
    DialogRangeRecoverStaminaThreshold = 107,
    DialogRangeRecoverStaminaThresholdTooltip = 108,
    DialogRangeRecoverHungerThreshold = 109,
    DialogRangeRecoverHungerThresholdTooltip = 110,
    DialogRangeRecoverThirstThreshold = 111,
    DialogRangeRecoverThirstThresholdTooltip = 112,
    DialogLabelAdvanced = 113,
    DialogLabelCreature = 114,
    DialogLabelDeveloper = 115,
    DialogLabelDoodad = 116,
    DialogLabelGeneral = 117,
    DialogLabelIsland = 118,
    DialogLabelItem = 119,
    DialogLabelItemProtection = 120,
    DialogLabelMultiplayer = 121,
    DialogLabelNPC = 122,
    DialogLabelPlayer = 123,
    DialogLabelRecoverThresholds = 124,
    DialogLabelTerrain = 125,
    DialogLabelPlanningAccuracy = 126,
    DialogModeGardener = 127,
    DialogModeGardenerTooltip = 128,
    DialogModeHarvester = 129,
    DialogModeHarvesterTooltip = 130,
    DialogModeQuest = 131,
    DialogModeQuestTooltip = 132,
    DialogModeSurvival = 133,
    DialogModeSurvivalTooltip = 134,
    DialogModeTerminator = 135,
    DialogModeTerminatorTooltip = 136,
    DialogModeTidyUp = 137,
    DialogModeTidyUpTooltip = 138,
    DialogModeAngler = 139,
    DialogModeAnglerTooltip = 140,
    DialogModeTreasureHunter = 141,
    DialogModeTreasureHunterTooltip = 142
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
