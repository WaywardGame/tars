import type { Events } from "event/EventEmitter";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import type { IContext } from "./core/context/IContext";
import type { ITarsOptions } from "./core/ITars";
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
    DialogTitleMain = 0,
    DialogStatusNavigatingInitializing = 1,
    DialogPanelGeneral = 2,
    DialogPanelTasks = 3,
    DialogPanelMoveTo = 4,
    DialogPanelOptions = 5,
    DialogButtonAquireItem = 6,
    DialogButtonAquireItemTooltip = 7,
    DialogButtonBuildDoodad = 8,
    DialogButtonBuildDoodadTooltip = 9,
    DialogButtonDeveloperMode = 10,
    DialogButtonDeveloperModeTooltip = 11,
    DialogButtonEnable = 12,
    DialogButtonExploreIslands = 13,
    DialogButtonExploreIslandsTooltip = 14,
    DialogButtonGoodCitizen = 15,
    DialogButtonGoodCitizenTooltip = 16,
    DialogButtonQuantumBurst = 17,
    DialogButtonQuantumBurstTooltip = 18,
    DialogButtonStayHealthy = 19,
    DialogButtonStayHealthyTooltip = 20,
    DialogButtonUseOrbsOfInfluence = 21,
    DialogButtonUseOrbsOfInfluenceTooltip = 22,
    DialogButtonSailToCivilization = 23,
    DialogButtonSailToCivilizationTooltip = 24,
    DialogButtonTameCreature = 25,
    DialogButtonTameCreatureTooltip = 26,
    DialogButtonMoveToBase = 27,
    DialogButtonMoveToDoodad = 28,
    DialogButtonMoveToIsland = 29,
    DialogButtonMoveToNPC = 30,
    DialogButtonMoveToCreature = 31,
    DialogButtonMoveToPlayer = 32,
    DialogButtonMoveToTerrain = 33,
    DialogRangeLabel = 34,
    DialogRangeRecoverHealthThreshold = 35,
    DialogRangeRecoverHealthThresholdTooltip = 36,
    DialogRangeRecoverStaminaThreshold = 37,
    DialogRangeRecoverStaminaThresholdTooltip = 38,
    DialogRangeRecoverHungerThreshold = 39,
    DialogRangeRecoverHungerThresholdTooltip = 40,
    DialogRangeRecoverThirstThreshold = 41,
    DialogRangeRecoverThirstThresholdTooltip = 42,
    DialogLabelAdvanced = 43,
    DialogLabelDoodad = 44,
    DialogLabelGeneral = 45,
    DialogLabelIsland = 46,
    DialogLabelItem = 47,
    DialogLabelMultiplayer = 48,
    DialogLabelNPC = 49,
    DialogLabelPlayer = 50,
    DialogLabelRecoverThresholds = 51,
    DialogLabelTerrain = 52,
    DialogLabelCreature = 53,
    DialogModeSurvival = 54,
    DialogModeSurvivalTooltip = 55,
    DialogModeTidyUp = 56,
    DialogModeTidyUpTooltip = 57,
    DialogModeGardener = 58,
    DialogModeGardenerTooltip = 59,
    DialogModeTerminator = 60,
    DialogModeTerminatorTooltip = 61,
    DialogModeQuest = 62,
    DialogModeQuestTooltip = 63
}
export interface ITarsOptionSection {
    option: keyof Omit<ITarsOptions, "mode">;
    title: TarsTranslation;
    tooltip: TarsTranslation;
    isDisabled?: () => boolean;
    slider?: {
        min: number | ((context: IContext) => number);
        max: number | ((context: IContext) => number);
    };
}
export declare const uiConfigurableOptions: Array<ITarsOptionSection | TarsTranslation | undefined>;
