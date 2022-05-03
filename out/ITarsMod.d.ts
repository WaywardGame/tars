import type { Events } from "event/EventEmitter";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import { ITarsOptions } from "./core/ITarsOptions";
import type { IContext } from "./core/context/IContext";
import type TarsMod from "./TarsMod";
export declare const TARS_ID = "TARS";
export declare function getTarsMod(): TarsMod;
export declare function setTarsMod(instance: TarsMod | undefined): void;
export declare function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation;
export declare function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T];
export interface ITarsModEvents extends Events<Mod> {
    enableChange(enabled: boolean): any;
    optionsChange(options: ITarsOptions): any;
    statusChange(status: TarsTranslation | string): any;
}
export interface ISaveData {
    enabled: boolean;
    configuredThresholds?: boolean;
    options: ITarsOptions;
    island: Record<string, Record<string, any>>;
    ui: Partial<Record<TarsUiSaveDataKey, any>>;
}
export declare enum TarsUiSaveDataKey {
    DialogOpened = 0,
    ActivePanelId = 1,
    AcquireItemDropdown = 2,
    BuildDoodadDropdown = 3,
    MoveToIslandDropdown = 4,
    MoveToTerrainDropdown = 5,
    MoveToDoodadDropdown = 6,
    MoveToCreatureDropdown = 7,
    MoveToPlayerDropdown = 8,
    MoveToNPCDropdown = 9,
    TameCreatureDropdown = 10
}
export declare enum TarsTranslation {
    Name = 0,
    DialogTitleMain = 1,
    DialogStatusNavigatingInitializing = 2,
    DialogPanelGeneral = 3,
    DialogPanelTasks = 4,
    DialogPanelMoveTo = 5,
    DialogPanelGlobalOptions = 6,
    DialogPanelModeOptions = 7,
    DialogButtonAllowProtectedItems = 8,
    DialogButtonAllowProtectedItemsTooltip = 9,
    DialogButtonAllowProtectedItemsWithBreakCheck = 10,
    DialogButtonAllowProtectedItemsWithBreakCheckTooltip = 11,
    DialogButtonAquireItem = 12,
    DialogButtonAquireItemTooltip = 13,
    DialogButtonBuildDoodad = 14,
    DialogButtonBuildDoodadTooltip = 15,
    DialogButtonDebugLogging = 16,
    DialogButtonDebugLoggingTooltip = 17,
    DialogButtonDisallowProtectedItems = 18,
    DialogButtonDisallowProtectedItemsTooltip = 19,
    DialogButtonAllowProtectedItemsForEquipment = 20,
    DialogButtonAllowProtectedItemsForEquipmentTooltip = 21,
    DialogButtonDiscoverAndUnlockTreasure = 22,
    DialogButtonDiscoverAndUnlockTreasureTooltip = 23,
    DialogButtonEnable = 24,
    DialogButtonExploreIslands = 25,
    DialogButtonExploreIslandsTooltip = 26,
    DialogButtonFreeze = 27,
    DialogButtonFreezeTooltip = 28,
    DialogButtonGoodCitizen = 29,
    DialogButtonGoodCitizenTooltip = 30,
    DialogButtonGardenerOnlyEdiblePlants = 31,
    DialogButtonGardenerOnlyEdiblePlantsTooltip = 32,
    DialogButtonHarvesterOnlyUseHands = 33,
    DialogButtonHarvesterOnlyUseHandsTooltip = 34,
    DialogButtonObtainTreasure = 35,
    DialogButtonObtainTreasureTooltip = 36,
    DialogButtonOnlyDiscoverTreasure = 37,
    DialogButtonOnlyDiscoverTreasureTooltip = 38,
    DialogButtonPrecognition = 39,
    DialogButtonPrecognitionTooltip = 40,
    DialogButtonQuantumBurst = 41,
    DialogButtonQuantumBurstTooltip = 42,
    DialogButtonAllowCaves = 43,
    DialogButtonAllowCavesTooltip = 44,
    DialogButtonLockInventory = 45,
    DialogButtonLockInventoryTooltip = 46,
    DialogButtonLockEquipment = 47,
    DialogButtonLockEquipmentTooltip = 48,
    DialogButtonReadBooks = 49,
    DialogButtonReadBooksTooltip = 50,
    DialogButtonClearSwamps = 51,
    DialogButtonClearSwampsTooltip = 52,
    DialogButtonOrganizeBase = 53,
    DialogButtonOrganizeBaseTooltip = 54,
    DialogButtonSailToCivilization = 55,
    DialogButtonSailToCivilizationTooltip = 56,
    DialogButtonStayHealthy = 57,
    DialogButtonStayHealthyTooltip = 58,
    DialogButtonTameCreature = 59,
    DialogButtonTameCreatureTooltip = 60,
    DialogButtonUseOrbsOfInfluence = 61,
    DialogButtonUseOrbsOfInfluenceTooltip = 62,
    DialogButtonMoveToBase = 63,
    DialogButtonMoveToDoodad = 64,
    DialogButtonMoveToIsland = 65,
    DialogButtonMoveToNPC = 66,
    DialogButtonMoveToCreature = 67,
    DialogButtonMoveToPlayer = 68,
    DialogButtonMoveToTerrain = 69,
    DialogRangeLabel = 70,
    DialogRangeRecoverHealthThreshold = 71,
    DialogRangeRecoverHealthThresholdTooltip = 72,
    DialogRangeRecoverStaminaThreshold = 73,
    DialogRangeRecoverStaminaThresholdTooltip = 74,
    DialogRangeRecoverHungerThreshold = 75,
    DialogRangeRecoverHungerThresholdTooltip = 76,
    DialogRangeRecoverThirstThreshold = 77,
    DialogRangeRecoverThirstThresholdTooltip = 78,
    DialogLabelAdvanced = 79,
    DialogLabelCreature = 80,
    DialogLabelDeveloper = 81,
    DialogLabelDoodad = 82,
    DialogLabelGeneral = 83,
    DialogLabelIsland = 84,
    DialogLabelItem = 85,
    DialogLabelItemProtection = 86,
    DialogLabelMultiplayer = 87,
    DialogLabelNPC = 88,
    DialogLabelPlayer = 89,
    DialogLabelRecoverThresholds = 90,
    DialogLabelTerrain = 91,
    DialogModeGardener = 92,
    DialogModeGardenerTooltip = 93,
    DialogModeHarvester = 94,
    DialogModeHarvesterTooltip = 95,
    DialogModeQuest = 96,
    DialogModeQuestTooltip = 97,
    DialogModeSurvival = 98,
    DialogModeSurvivalTooltip = 99,
    DialogModeTerminator = 100,
    DialogModeTerminatorTooltip = 101,
    DialogModeTidyUp = 102,
    DialogModeTidyUpTooltip = 103,
    DialogModeTreasureHunter = 104,
    DialogModeTreasureHunterTooltip = 105
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
