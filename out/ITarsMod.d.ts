import type { Events } from "event/EventEmitter";
import type { IslandId } from "game/island/IIsland";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import { Reference } from "game/reference/IReferenceManager";
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
    DialogButtonAllowCaves = 54,
    DialogButtonAllowCavesTooltip = 55,
    DialogButtonLockInventory = 56,
    DialogButtonLockInventoryTooltip = 57,
    DialogButtonLockEquipment = 58,
    DialogButtonLockEquipmentTooltip = 59,
    DialogButtonReadBooks = 60,
    DialogButtonReadBooksTooltip = 61,
    DialogButtonClearSwamps = 62,
    DialogButtonClearSwampsTooltip = 63,
    DialogButtonOrganizeBase = 64,
    DialogButtonOrganizeBaseTooltip = 65,
    DialogButtonAllowBackpacks = 66,
    DialogButtonAllowBackpacksTooltip = 67,
    DialogButtonMaintainLowDifficulty = 68,
    DialogButtonMaintainLowDifficultyTooltip = 69,
    DialogButtonSailToCivilization = 70,
    DialogButtonSailToCivilizationTooltip = 71,
    DialogButtonStayHealthy = 72,
    DialogButtonStayHealthyTooltip = 73,
    DialogButtonTameCreature = 74,
    DialogButtonTameCreatureTooltip = 75,
    DialogButtonUseOrbsOfInfluence = 76,
    DialogButtonUseOrbsOfInfluenceTooltip = 77,
    DialogButtonSpawnNPC = 78,
    DialogButtonSpawnNPCTooltip = 79,
    DialogButtonLoadTooltip = 80,
    DialogButtonRenameTooltip = 81,
    DialogButtonConfigurationTooltip = 82,
    DialogButtonDeleteTooltip = 83,
    DialogButtonSaveData = 84,
    DialogButtonSaveDataTooltip = 85,
    DialogButtonImportData = 86,
    DialogButtonImportDataTooltip = 87,
    DialogButtonExportTooltip = 88,
    DialogButtonMoveToBase = 89,
    DialogButtonMoveToDoodad = 90,
    DialogButtonMoveToIsland = 91,
    DialogButtonMoveToNPC = 92,
    DialogButtonMoveToCreature = 93,
    DialogButtonMoveToPlayer = 94,
    DialogButtonMoveToTerrain = 95,
    DialogButtonFollowPlayer = 96,
    DialogButtonFollowNPC = 97,
    DialogLabel = 98,
    DialogRangeRecoverHealthThreshold = 99,
    DialogRangeRecoverHealthThresholdTooltip = 100,
    DialogRangeRecoverStaminaThreshold = 101,
    DialogRangeRecoverStaminaThresholdTooltip = 102,
    DialogRangeRecoverHungerThreshold = 103,
    DialogRangeRecoverHungerThresholdTooltip = 104,
    DialogRangeRecoverThirstThreshold = 105,
    DialogRangeRecoverThirstThresholdTooltip = 106,
    DialogLabelAdvanced = 107,
    DialogLabelCreature = 108,
    DialogLabelDeveloper = 109,
    DialogLabelDoodad = 110,
    DialogLabelGeneral = 111,
    DialogLabelIsland = 112,
    DialogLabelItem = 113,
    DialogLabelItemProtection = 114,
    DialogLabelMultiplayer = 115,
    DialogLabelNPC = 116,
    DialogLabelPlayer = 117,
    DialogLabelRecoverThresholds = 118,
    DialogLabelTerrain = 119,
    DialogLabelPlanningAccuracy = 120,
    DialogModeGardener = 121,
    DialogModeGardenerTooltip = 122,
    DialogModeHarvester = 123,
    DialogModeHarvesterTooltip = 124,
    DialogModeQuest = 125,
    DialogModeQuestTooltip = 126,
    DialogModeSurvival = 127,
    DialogModeSurvivalTooltip = 128,
    DialogModeTerminator = 129,
    DialogModeTerminatorTooltip = 130,
    DialogModeTidyUp = 131,
    DialogModeTidyUpTooltip = 132,
    DialogModeAngler = 133,
    DialogModeAnglerTooltip = 134,
    DialogModeTreasureHunter = 135,
    DialogModeTreasureHunterTooltip = 136
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
export declare type TarsOptionSection = ITarsCheckboxOptionSection | ITarsChoiceOptionSection | ITarsSliderOptionSection;
export declare const uiConfigurableGlobalOptions: Array<TarsOptionSection | TarsTranslation | undefined>;
export declare const uiConfigurableModeOptions: Array<TarsOptionSection | TarsTranslation | undefined>;
export {};
