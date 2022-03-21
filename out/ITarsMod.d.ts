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
    DialogButtonGoodCitizen = 27,
    DialogButtonGoodCitizenTooltip = 28,
    DialogButtonHarvesterOnlyUseHands = 29,
    DialogButtonHarvesterOnlyUseHandsTooltip = 30,
    DialogButtonObtainTreasure = 31,
    DialogButtonObtainTreasureTooltip = 32,
    DialogButtonOnlyDiscoverTreasure = 33,
    DialogButtonOnlyDiscoverTreasureTooltip = 34,
    DialogButtonPrecognition = 35,
    DialogButtonPrecognitionTooltip = 36,
    DialogButtonQuantumBurst = 37,
    DialogButtonQuantumBurstTooltip = 38,
    DialogButtonAllowCaves = 39,
    DialogButtonAllowCavesTooltip = 40,
    DialogButtonReadBooks = 41,
    DialogButtonReadBooksTooltip = 42,
    DialogButtonClearSwamps = 43,
    DialogButtonClearSwampsTooltip = 44,
    DialogButtonOrganizeBase = 45,
    DialogButtonOrganizeBaseTooltip = 46,
    DialogButtonSailToCivilization = 47,
    DialogButtonSailToCivilizationTooltip = 48,
    DialogButtonStayHealthy = 49,
    DialogButtonStayHealthyTooltip = 50,
    DialogButtonTameCreature = 51,
    DialogButtonTameCreatureTooltip = 52,
    DialogButtonUseOrbsOfInfluence = 53,
    DialogButtonUseOrbsOfInfluenceTooltip = 54,
    DialogButtonMoveToBase = 55,
    DialogButtonMoveToDoodad = 56,
    DialogButtonMoveToIsland = 57,
    DialogButtonMoveToNPC = 58,
    DialogButtonMoveToCreature = 59,
    DialogButtonMoveToPlayer = 60,
    DialogButtonMoveToTerrain = 61,
    DialogRangeLabel = 62,
    DialogRangeRecoverHealthThreshold = 63,
    DialogRangeRecoverHealthThresholdTooltip = 64,
    DialogRangeRecoverStaminaThreshold = 65,
    DialogRangeRecoverStaminaThresholdTooltip = 66,
    DialogRangeRecoverHungerThreshold = 67,
    DialogRangeRecoverHungerThresholdTooltip = 68,
    DialogRangeRecoverThirstThreshold = 69,
    DialogRangeRecoverThirstThresholdTooltip = 70,
    DialogLabelAdvanced = 71,
    DialogLabelCreature = 72,
    DialogLabelDeveloper = 73,
    DialogLabelDoodad = 74,
    DialogLabelGeneral = 75,
    DialogLabelIsland = 76,
    DialogLabelItem = 77,
    DialogLabelItemProtection = 78,
    DialogLabelMultiplayer = 79,
    DialogLabelNPC = 80,
    DialogLabelPlayer = 81,
    DialogLabelRecoverThresholds = 82,
    DialogLabelTerrain = 83,
    DialogModeGardener = 84,
    DialogModeGardenerTooltip = 85,
    DialogModeHarvester = 86,
    DialogModeHarvesterTooltip = 87,
    DialogModeQuest = 88,
    DialogModeQuestTooltip = 89,
    DialogModeSurvival = 90,
    DialogModeSurvivalTooltip = 91,
    DialogModeTerminator = 92,
    DialogModeTerminatorTooltip = 93,
    DialogModeTidyUp = 94,
    DialogModeTidyUpTooltip = 95,
    DialogModeTreasureHunter = 96,
    DialogModeTreasureHunterTooltip = 97
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
