import type { Events } from "event/EventEmitter";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import type { IslandId } from "game/island/IIsland";
import { ITarsOptions } from "./core/ITarsOptions";
import type { IContext } from "./core/context/IContext";
import type TarsMod from "./TarsMod";
export declare const TARS_ID = "TARS";
export declare function getTarsMod(): TarsMod;
export declare function setTarsMod(instance: TarsMod | undefined): void;
export declare function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation;
export declare function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T];
export interface ITarsModEvents extends Events<Mod> {
    statusChange(): any;
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
    DialogButtonSailToCivilization = 66,
    DialogButtonSailToCivilizationTooltip = 67,
    DialogButtonStayHealthy = 68,
    DialogButtonStayHealthyTooltip = 69,
    DialogButtonTameCreature = 70,
    DialogButtonTameCreatureTooltip = 71,
    DialogButtonUseOrbsOfInfluence = 72,
    DialogButtonUseOrbsOfInfluenceTooltip = 73,
    DialogButtonSpawnNPC = 74,
    DialogButtonSpawnNPCTooltip = 75,
    DialogButtonLoadTooltip = 76,
    DialogButtonRenameTooltip = 77,
    DialogButtonConfigurationTooltip = 78,
    DialogButtonDeleteTooltip = 79,
    DialogButtonSaveData = 80,
    DialogButtonSaveDataTooltip = 81,
    DialogButtonImportData = 82,
    DialogButtonImportDataTooltip = 83,
    DialogButtonExportTooltip = 84,
    DialogButtonMoveToBase = 85,
    DialogButtonMoveToDoodad = 86,
    DialogButtonMoveToIsland = 87,
    DialogButtonMoveToNPC = 88,
    DialogButtonMoveToCreature = 89,
    DialogButtonMoveToPlayer = 90,
    DialogButtonMoveToTerrain = 91,
    DialogLabel = 92,
    DialogRangeRecoverHealthThreshold = 93,
    DialogRangeRecoverHealthThresholdTooltip = 94,
    DialogRangeRecoverStaminaThreshold = 95,
    DialogRangeRecoverStaminaThresholdTooltip = 96,
    DialogRangeRecoverHungerThreshold = 97,
    DialogRangeRecoverHungerThresholdTooltip = 98,
    DialogRangeRecoverThirstThreshold = 99,
    DialogRangeRecoverThirstThresholdTooltip = 100,
    DialogLabelAdvanced = 101,
    DialogLabelCreature = 102,
    DialogLabelDeveloper = 103,
    DialogLabelDoodad = 104,
    DialogLabelGeneral = 105,
    DialogLabelIsland = 106,
    DialogLabelItem = 107,
    DialogLabelItemProtection = 108,
    DialogLabelMultiplayer = 109,
    DialogLabelNPC = 110,
    DialogLabelPlayer = 111,
    DialogLabelRecoverThresholds = 112,
    DialogLabelTerrain = 113,
    DialogLabelPlanningAccuracy = 114,
    DialogModeGardener = 115,
    DialogModeGardenerTooltip = 116,
    DialogModeHarvester = 117,
    DialogModeHarvesterTooltip = 118,
    DialogModeQuest = 119,
    DialogModeQuestTooltip = 120,
    DialogModeSurvival = 121,
    DialogModeSurvivalTooltip = 122,
    DialogModeTerminator = 123,
    DialogModeTerminatorTooltip = 124,
    DialogModeTidyUp = 125,
    DialogModeTidyUpTooltip = 126,
    DialogModeTreasureHunter = 127,
    DialogModeTreasureHunterTooltip = 128
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
