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
    MoveToPlayerDropdown = 7,
    MoveToNPCDropdown = 8
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
    DialogButtonMoveToBase = 25,
    DialogButtonMoveToDoodad = 26,
    DialogButtonMoveToIsland = 27,
    DialogButtonMoveToNPC = 28,
    DialogButtonMoveToPlayer = 29,
    DialogButtonMoveToTerrain = 30,
    DialogRangeLabel = 31,
    DialogRangeRecoverHealthThreshold = 32,
    DialogRangeRecoverHealthThresholdTooltip = 33,
    DialogRangeRecoverStaminaThreshold = 34,
    DialogRangeRecoverStaminaThresholdTooltip = 35,
    DialogRangeRecoverHungerThreshold = 36,
    DialogRangeRecoverHungerThresholdTooltip = 37,
    DialogRangeRecoverThirstThreshold = 38,
    DialogRangeRecoverThirstThresholdTooltip = 39,
    DialogLabelAdvanced = 40,
    DialogLabelDoodad = 41,
    DialogLabelGeneral = 42,
    DialogLabelIsland = 43,
    DialogLabelItem = 44,
    DialogLabelMultiplayer = 45,
    DialogLabelNPC = 46,
    DialogLabelPlayer = 47,
    DialogLabelRecoverThresholds = 48,
    DialogLabelTerrain = 49,
    DialogModeSurvival = 50,
    DialogModeSurvivalTooltip = 51,
    DialogModeTidyUp = 52,
    DialogModeTidyUpTooltip = 53,
    DialogModeGardener = 54,
    DialogModeGardenerTooltip = 55,
    DialogModeTerminator = 56,
    DialogModeTerminatorTooltip = 57,
    DialogModeQuest = 58,
    DialogModeQuestTooltip = 59
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
