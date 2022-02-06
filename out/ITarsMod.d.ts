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
    DialogPanelOptions = 6,
    DialogButtonAquireItem = 7,
    DialogButtonAquireItemTooltip = 8,
    DialogButtonBuildDoodad = 9,
    DialogButtonBuildDoodadTooltip = 10,
    DialogButtonDebugLogging = 11,
    DialogButtonDebugLoggingTooltip = 12,
    DialogButtonFreeze = 13,
    DialogButtonFreezeTooltip = 14,
    DialogButtonEnable = 15,
    DialogButtonExploreIslands = 16,
    DialogButtonExploreIslandsTooltip = 17,
    DialogButtonGoodCitizen = 18,
    DialogButtonGoodCitizenTooltip = 19,
    DialogButtonQuantumBurst = 20,
    DialogButtonQuantumBurstTooltip = 21,
    DialogButtonStayHealthy = 22,
    DialogButtonStayHealthyTooltip = 23,
    DialogButtonDisallowProtectedItems = 24,
    DialogButtonDisallowProtectedItemsTooltip = 25,
    DialogButtonAllowProtectedItems = 26,
    DialogButtonAllowProtectedItemsTooltip = 27,
    DialogButtonAllowProtectedItemsWithBreakCheck = 28,
    DialogButtonAllowProtectedItemsWithBreakCheckTooltip = 29,
    DialogButtonUseOrbsOfInfluence = 30,
    DialogButtonUseOrbsOfInfluenceTooltip = 31,
    DialogButtonReadBooks = 32,
    DialogButtonReadBooksTooltip = 33,
    DialogButtonSailToCivilization = 34,
    DialogButtonSailToCivilizationTooltip = 35,
    DialogButtonTameCreature = 36,
    DialogButtonTameCreatureTooltip = 37,
    DialogButtonMoveToBase = 38,
    DialogButtonMoveToDoodad = 39,
    DialogButtonMoveToIsland = 40,
    DialogButtonMoveToNPC = 41,
    DialogButtonMoveToCreature = 42,
    DialogButtonMoveToPlayer = 43,
    DialogButtonMoveToTerrain = 44,
    DialogRangeLabel = 45,
    DialogRangeRecoverHealthThreshold = 46,
    DialogRangeRecoverHealthThresholdTooltip = 47,
    DialogRangeRecoverStaminaThreshold = 48,
    DialogRangeRecoverStaminaThresholdTooltip = 49,
    DialogRangeRecoverHungerThreshold = 50,
    DialogRangeRecoverHungerThresholdTooltip = 51,
    DialogRangeRecoverThirstThreshold = 52,
    DialogRangeRecoverThirstThresholdTooltip = 53,
    DialogLabelAdvanced = 54,
    DialogLabelCreature = 55,
    DialogLabelDeveloper = 56,
    DialogLabelDoodad = 57,
    DialogLabelGeneral = 58,
    DialogLabelIsland = 59,
    DialogLabelItem = 60,
    DialogLabelMultiplayer = 61,
    DialogLabelNPC = 62,
    DialogLabelPlayer = 63,
    DialogLabelRecoverThresholds = 64,
    DialogLabelTerrain = 65,
    DialogModeGardener = 66,
    DialogModeGardenerTooltip = 67,
    DialogModeHarvester = 68,
    DialogModeHarvesterTooltip = 69,
    DialogModeQuest = 70,
    DialogModeQuestTooltip = 71,
    DialogModeSurvival = 72,
    DialogModeSurvivalTooltip = 73,
    DialogModeTerminator = 74,
    DialogModeTerminatorTooltip = 75,
    DialogModeTidyUp = 76,
    DialogModeTidyUpTooltip = 77
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
export declare const uiConfigurableOptions: Array<TarsOptionSection | TarsTranslation | undefined>;
export {};
