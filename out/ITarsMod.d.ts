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
    DialogButtonSailToCivilization = 68,
    DialogButtonSailToCivilizationTooltip = 69,
    DialogButtonStayHealthy = 70,
    DialogButtonStayHealthyTooltip = 71,
    DialogButtonTameCreature = 72,
    DialogButtonTameCreatureTooltip = 73,
    DialogButtonUseOrbsOfInfluence = 74,
    DialogButtonUseOrbsOfInfluenceTooltip = 75,
    DialogButtonSpawnNPC = 76,
    DialogButtonSpawnNPCTooltip = 77,
    DialogButtonLoadTooltip = 78,
    DialogButtonRenameTooltip = 79,
    DialogButtonConfigurationTooltip = 80,
    DialogButtonDeleteTooltip = 81,
    DialogButtonSaveData = 82,
    DialogButtonSaveDataTooltip = 83,
    DialogButtonImportData = 84,
    DialogButtonImportDataTooltip = 85,
    DialogButtonExportTooltip = 86,
    DialogButtonMoveToBase = 87,
    DialogButtonMoveToDoodad = 88,
    DialogButtonMoveToIsland = 89,
    DialogButtonMoveToNPC = 90,
    DialogButtonMoveToCreature = 91,
    DialogButtonMoveToPlayer = 92,
    DialogButtonMoveToTerrain = 93,
    DialogButtonFollowPlayer = 94,
    DialogButtonFollowNPC = 95,
    DialogLabel = 96,
    DialogRangeRecoverHealthThreshold = 97,
    DialogRangeRecoverHealthThresholdTooltip = 98,
    DialogRangeRecoverStaminaThreshold = 99,
    DialogRangeRecoverStaminaThresholdTooltip = 100,
    DialogRangeRecoverHungerThreshold = 101,
    DialogRangeRecoverHungerThresholdTooltip = 102,
    DialogRangeRecoverThirstThreshold = 103,
    DialogRangeRecoverThirstThresholdTooltip = 104,
    DialogLabelAdvanced = 105,
    DialogLabelCreature = 106,
    DialogLabelDeveloper = 107,
    DialogLabelDoodad = 108,
    DialogLabelGeneral = 109,
    DialogLabelIsland = 110,
    DialogLabelItem = 111,
    DialogLabelItemProtection = 112,
    DialogLabelMultiplayer = 113,
    DialogLabelNPC = 114,
    DialogLabelPlayer = 115,
    DialogLabelRecoverThresholds = 116,
    DialogLabelTerrain = 117,
    DialogLabelPlanningAccuracy = 118,
    DialogModeGardener = 119,
    DialogModeGardenerTooltip = 120,
    DialogModeHarvester = 121,
    DialogModeHarvesterTooltip = 122,
    DialogModeQuest = 123,
    DialogModeQuestTooltip = 124,
    DialogModeSurvival = 125,
    DialogModeSurvivalTooltip = 126,
    DialogModeTerminator = 127,
    DialogModeTerminatorTooltip = 128,
    DialogModeTidyUp = 129,
    DialogModeTidyUpTooltip = 130,
    DialogModeAngler = 131,
    DialogModeAnglerTooltip = 132,
    DialogModeTreasureHunter = 133,
    DialogModeTreasureHunterTooltip = 134
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
