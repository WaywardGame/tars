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
    DialogButtonReadBooks = 39,
    DialogButtonReadBooksTooltip = 40,
    DialogButtonClearSwamps = 41,
    DialogButtonClearSwampsTooltip = 42,
    DialogButtonOrganizeBase = 43,
    DialogButtonOrganizeBaseTooltip = 44,
    DialogButtonSailToCivilization = 45,
    DialogButtonSailToCivilizationTooltip = 46,
    DialogButtonStayHealthy = 47,
    DialogButtonStayHealthyTooltip = 48,
    DialogButtonTameCreature = 49,
    DialogButtonTameCreatureTooltip = 50,
    DialogButtonUseOrbsOfInfluence = 51,
    DialogButtonUseOrbsOfInfluenceTooltip = 52,
    DialogButtonMoveToBase = 53,
    DialogButtonMoveToDoodad = 54,
    DialogButtonMoveToIsland = 55,
    DialogButtonMoveToNPC = 56,
    DialogButtonMoveToCreature = 57,
    DialogButtonMoveToPlayer = 58,
    DialogButtonMoveToTerrain = 59,
    DialogRangeLabel = 60,
    DialogRangeRecoverHealthThreshold = 61,
    DialogRangeRecoverHealthThresholdTooltip = 62,
    DialogRangeRecoverStaminaThreshold = 63,
    DialogRangeRecoverStaminaThresholdTooltip = 64,
    DialogRangeRecoverHungerThreshold = 65,
    DialogRangeRecoverHungerThresholdTooltip = 66,
    DialogRangeRecoverThirstThreshold = 67,
    DialogRangeRecoverThirstThresholdTooltip = 68,
    DialogLabelAdvanced = 69,
    DialogLabelCreature = 70,
    DialogLabelDeveloper = 71,
    DialogLabelDoodad = 72,
    DialogLabelGeneral = 73,
    DialogLabelIsland = 74,
    DialogLabelItem = 75,
    DialogLabelItemProtection = 76,
    DialogLabelMultiplayer = 77,
    DialogLabelNPC = 78,
    DialogLabelPlayer = 79,
    DialogLabelRecoverThresholds = 80,
    DialogLabelTerrain = 81,
    DialogModeGardener = 82,
    DialogModeGardenerTooltip = 83,
    DialogModeHarvester = 84,
    DialogModeHarvesterTooltip = 85,
    DialogModeQuest = 86,
    DialogModeQuestTooltip = 87,
    DialogModeSurvival = 88,
    DialogModeSurvivalTooltip = 89,
    DialogModeTerminator = 90,
    DialogModeTerminatorTooltip = 91,
    DialogModeTidyUp = 92,
    DialogModeTidyUpTooltip = 93,
    DialogModeTreasureHunter = 94,
    DialogModeTreasureHunterTooltip = 95
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
