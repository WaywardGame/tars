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
    DialogButtonHarvesterOnlyUseHands = 31,
    DialogButtonHarvesterOnlyUseHandsTooltip = 32,
    DialogButtonObtainTreasure = 33,
    DialogButtonObtainTreasureTooltip = 34,
    DialogButtonOnlyDiscoverTreasure = 35,
    DialogButtonOnlyDiscoverTreasureTooltip = 36,
    DialogButtonPrecognition = 37,
    DialogButtonPrecognitionTooltip = 38,
    DialogButtonQuantumBurst = 39,
    DialogButtonQuantumBurstTooltip = 40,
    DialogButtonAllowCaves = 41,
    DialogButtonAllowCavesTooltip = 42,
    DialogButtonLockInventory = 43,
    DialogButtonLockInventoryTooltip = 44,
    DialogButtonLockEquipment = 45,
    DialogButtonLockEquipmentTooltip = 46,
    DialogButtonReadBooks = 47,
    DialogButtonReadBooksTooltip = 48,
    DialogButtonClearSwamps = 49,
    DialogButtonClearSwampsTooltip = 50,
    DialogButtonOrganizeBase = 51,
    DialogButtonOrganizeBaseTooltip = 52,
    DialogButtonSailToCivilization = 53,
    DialogButtonSailToCivilizationTooltip = 54,
    DialogButtonStayHealthy = 55,
    DialogButtonStayHealthyTooltip = 56,
    DialogButtonTameCreature = 57,
    DialogButtonTameCreatureTooltip = 58,
    DialogButtonUseOrbsOfInfluence = 59,
    DialogButtonUseOrbsOfInfluenceTooltip = 60,
    DialogButtonMoveToBase = 61,
    DialogButtonMoveToDoodad = 62,
    DialogButtonMoveToIsland = 63,
    DialogButtonMoveToNPC = 64,
    DialogButtonMoveToCreature = 65,
    DialogButtonMoveToPlayer = 66,
    DialogButtonMoveToTerrain = 67,
    DialogRangeLabel = 68,
    DialogRangeRecoverHealthThreshold = 69,
    DialogRangeRecoverHealthThresholdTooltip = 70,
    DialogRangeRecoverStaminaThreshold = 71,
    DialogRangeRecoverStaminaThresholdTooltip = 72,
    DialogRangeRecoverHungerThreshold = 73,
    DialogRangeRecoverHungerThresholdTooltip = 74,
    DialogRangeRecoverThirstThreshold = 75,
    DialogRangeRecoverThirstThresholdTooltip = 76,
    DialogLabelAdvanced = 77,
    DialogLabelCreature = 78,
    DialogLabelDeveloper = 79,
    DialogLabelDoodad = 80,
    DialogLabelGeneral = 81,
    DialogLabelIsland = 82,
    DialogLabelItem = 83,
    DialogLabelItemProtection = 84,
    DialogLabelMultiplayer = 85,
    DialogLabelNPC = 86,
    DialogLabelPlayer = 87,
    DialogLabelRecoverThresholds = 88,
    DialogLabelTerrain = 89,
    DialogModeGardener = 90,
    DialogModeGardenerTooltip = 91,
    DialogModeHarvester = 92,
    DialogModeHarvesterTooltip = 93,
    DialogModeQuest = 94,
    DialogModeQuestTooltip = 95,
    DialogModeSurvival = 96,
    DialogModeSurvivalTooltip = 97,
    DialogModeTerminator = 98,
    DialogModeTerminatorTooltip = 99,
    DialogModeTidyUp = 100,
    DialogModeTidyUpTooltip = 101,
    DialogModeTreasureHunter = 102,
    DialogModeTreasureHunterTooltip = 103
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
