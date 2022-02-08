import type { Events } from "event/EventEmitter";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import type { IContext } from "./core/context/IContext";
import { ITarsOptions } from "./core/ITars";
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
    DialogButtonObtainTreasure = 29,
    DialogButtonObtainTreasureTooltip = 30,
    DialogButtonOnlyDiscoverTreasure = 31,
    DialogButtonOnlyDiscoverTreasureTooltip = 32,
    DialogButtonPrecognition = 33,
    DialogButtonPrecognitionTooltip = 34,
    DialogButtonQuantumBurst = 35,
    DialogButtonQuantumBurstTooltip = 36,
    DialogButtonReadBooks = 37,
    DialogButtonReadBooksTooltip = 38,
    DialogButtonSailToCivilization = 39,
    DialogButtonSailToCivilizationTooltip = 40,
    DialogButtonStayHealthy = 41,
    DialogButtonStayHealthyTooltip = 42,
    DialogButtonTameCreature = 43,
    DialogButtonTameCreatureTooltip = 44,
    DialogButtonUseOrbsOfInfluence = 45,
    DialogButtonUseOrbsOfInfluenceTooltip = 46,
    DialogButtonMoveToBase = 47,
    DialogButtonMoveToDoodad = 48,
    DialogButtonMoveToIsland = 49,
    DialogButtonMoveToNPC = 50,
    DialogButtonMoveToCreature = 51,
    DialogButtonMoveToPlayer = 52,
    DialogButtonMoveToTerrain = 53,
    DialogRangeLabel = 54,
    DialogRangeRecoverHealthThreshold = 55,
    DialogRangeRecoverHealthThresholdTooltip = 56,
    DialogRangeRecoverStaminaThreshold = 57,
    DialogRangeRecoverStaminaThresholdTooltip = 58,
    DialogRangeRecoverHungerThreshold = 59,
    DialogRangeRecoverHungerThresholdTooltip = 60,
    DialogRangeRecoverThirstThreshold = 61,
    DialogRangeRecoverThirstThresholdTooltip = 62,
    DialogLabelAdvanced = 63,
    DialogLabelCreature = 64,
    DialogLabelDeveloper = 65,
    DialogLabelDoodad = 66,
    DialogLabelGeneral = 67,
    DialogLabelIsland = 68,
    DialogLabelItem = 69,
    DialogLabelItemProtection = 70,
    DialogLabelMultiplayer = 71,
    DialogLabelNPC = 72,
    DialogLabelPlayer = 73,
    DialogLabelRecoverThresholds = 74,
    DialogLabelTerrain = 75,
    DialogModeGardener = 76,
    DialogModeGardenerTooltip = 77,
    DialogModeHarvester = 78,
    DialogModeHarvesterTooltip = 79,
    DialogModeQuest = 80,
    DialogModeQuestTooltip = 81,
    DialogModeSurvival = 82,
    DialogModeSurvivalTooltip = 83,
    DialogModeTerminator = 84,
    DialogModeTerminatorTooltip = 85,
    DialogModeTidyUp = 86,
    DialogModeTidyUpTooltip = 87,
    DialogModeTreasureHunter = 88,
    DialogModeTreasureHunterTooltip = 89
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
