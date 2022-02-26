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
    DialogButtonDiscoverAndUnlockTreasure = 20,
    DialogButtonDiscoverAndUnlockTreasureTooltip = 21,
    DialogButtonEnable = 22,
    DialogButtonExploreIslands = 23,
    DialogButtonExploreIslandsTooltip = 24,
    DialogButtonFreeze = 25,
    DialogButtonFreezeTooltip = 26,
    DialogButtonFasterPlanning = 27,
    DialogButtonFasterPlanningTooltip = 28,
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
    DialogButtonReadBooks = 43,
    DialogButtonReadBooksTooltip = 44,
    DialogButtonClearSwamps = 45,
    DialogButtonClearSwampsTooltip = 46,
    DialogButtonOrganizeBase = 47,
    DialogButtonOrganizeBaseTooltip = 48,
    DialogButtonSailToCivilization = 49,
    DialogButtonSailToCivilizationTooltip = 50,
    DialogButtonStayHealthy = 51,
    DialogButtonStayHealthyTooltip = 52,
    DialogButtonTameCreature = 53,
    DialogButtonTameCreatureTooltip = 54,
    DialogButtonUseOrbsOfInfluence = 55,
    DialogButtonUseOrbsOfInfluenceTooltip = 56,
    DialogButtonMoveToBase = 57,
    DialogButtonMoveToDoodad = 58,
    DialogButtonMoveToIsland = 59,
    DialogButtonMoveToNPC = 60,
    DialogButtonMoveToCreature = 61,
    DialogButtonMoveToPlayer = 62,
    DialogButtonMoveToTerrain = 63,
    DialogRangeLabel = 64,
    DialogRangeRecoverHealthThreshold = 65,
    DialogRangeRecoverHealthThresholdTooltip = 66,
    DialogRangeRecoverStaminaThreshold = 67,
    DialogRangeRecoverStaminaThresholdTooltip = 68,
    DialogRangeRecoverHungerThreshold = 69,
    DialogRangeRecoverHungerThresholdTooltip = 70,
    DialogRangeRecoverThirstThreshold = 71,
    DialogRangeRecoverThirstThresholdTooltip = 72,
    DialogLabelAdvanced = 73,
    DialogLabelCreature = 74,
    DialogLabelDeveloper = 75,
    DialogLabelDoodad = 76,
    DialogLabelGeneral = 77,
    DialogLabelIsland = 78,
    DialogLabelItem = 79,
    DialogLabelItemProtection = 80,
    DialogLabelMultiplayer = 81,
    DialogLabelNPC = 82,
    DialogLabelPlayer = 83,
    DialogLabelRecoverThresholds = 84,
    DialogLabelTerrain = 85,
    DialogModeGardener = 86,
    DialogModeGardenerTooltip = 87,
    DialogModeHarvester = 88,
    DialogModeHarvesterTooltip = 89,
    DialogModeQuest = 90,
    DialogModeQuestTooltip = 91,
    DialogModeSurvival = 92,
    DialogModeSurvivalTooltip = 93,
    DialogModeTerminator = 94,
    DialogModeTerminatorTooltip = 95,
    DialogModeTidyUp = 96,
    DialogModeTidyUpTooltip = 97,
    DialogModeTreasureHunter = 98,
    DialogModeTreasureHunterTooltip = 99
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
