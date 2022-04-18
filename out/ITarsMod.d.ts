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
    DialogButtonLockInventory = 41,
    DialogButtonLockInventoryTooltip = 42,
    DialogButtonLockEquipment = 43,
    DialogButtonLockEquipmentTooltip = 44,
    DialogButtonReadBooks = 45,
    DialogButtonReadBooksTooltip = 46,
    DialogButtonClearSwamps = 47,
    DialogButtonClearSwampsTooltip = 48,
    DialogButtonOrganizeBase = 49,
    DialogButtonOrganizeBaseTooltip = 50,
    DialogButtonSailToCivilization = 51,
    DialogButtonSailToCivilizationTooltip = 52,
    DialogButtonStayHealthy = 53,
    DialogButtonStayHealthyTooltip = 54,
    DialogButtonTameCreature = 55,
    DialogButtonTameCreatureTooltip = 56,
    DialogButtonUseOrbsOfInfluence = 57,
    DialogButtonUseOrbsOfInfluenceTooltip = 58,
    DialogButtonMoveToBase = 59,
    DialogButtonMoveToDoodad = 60,
    DialogButtonMoveToIsland = 61,
    DialogButtonMoveToNPC = 62,
    DialogButtonMoveToCreature = 63,
    DialogButtonMoveToPlayer = 64,
    DialogButtonMoveToTerrain = 65,
    DialogRangeLabel = 66,
    DialogRangeRecoverHealthThreshold = 67,
    DialogRangeRecoverHealthThresholdTooltip = 68,
    DialogRangeRecoverStaminaThreshold = 69,
    DialogRangeRecoverStaminaThresholdTooltip = 70,
    DialogRangeRecoverHungerThreshold = 71,
    DialogRangeRecoverHungerThresholdTooltip = 72,
    DialogRangeRecoverThirstThreshold = 73,
    DialogRangeRecoverThirstThresholdTooltip = 74,
    DialogLabelAdvanced = 75,
    DialogLabelCreature = 76,
    DialogLabelDeveloper = 77,
    DialogLabelDoodad = 78,
    DialogLabelGeneral = 79,
    DialogLabelIsland = 80,
    DialogLabelItem = 81,
    DialogLabelItemProtection = 82,
    DialogLabelMultiplayer = 83,
    DialogLabelNPC = 84,
    DialogLabelPlayer = 85,
    DialogLabelRecoverThresholds = 86,
    DialogLabelTerrain = 87,
    DialogModeGardener = 88,
    DialogModeGardenerTooltip = 89,
    DialogModeHarvester = 90,
    DialogModeHarvesterTooltip = 91,
    DialogModeQuest = 92,
    DialogModeQuestTooltip = 93,
    DialogModeSurvival = 94,
    DialogModeSurvivalTooltip = 95,
    DialogModeTerminator = 96,
    DialogModeTerminatorTooltip = 97,
    DialogModeTidyUp = 98,
    DialogModeTidyUpTooltip = 99,
    DialogModeTreasureHunter = 100,
    DialogModeTreasureHunterTooltip = 101
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
