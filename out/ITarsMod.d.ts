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
    DialogButtonMoveToBase = 23,
    DialogButtonMoveToDoodad = 24,
    DialogButtonMoveToIsland = 25,
    DialogButtonMoveToNPC = 26,
    DialogButtonMoveToPlayer = 27,
    DialogButtonMoveToTerrain = 28,
    DialogRangeLabel = 29,
    DialogRangeRecoverHealthThreshold = 30,
    DialogRangeRecoverHealthThresholdTooltip = 31,
    DialogRangeRecoverStaminaThreshold = 32,
    DialogRangeRecoverStaminaThresholdTooltip = 33,
    DialogRangeRecoverHungerThreshold = 34,
    DialogRangeRecoverHungerThresholdTooltip = 35,
    DialogRangeRecoverThirstThreshold = 36,
    DialogRangeRecoverThirstThresholdTooltip = 37,
    DialogLabelAdvanced = 38,
    DialogLabelDoodad = 39,
    DialogLabelGeneral = 40,
    DialogLabelIsland = 41,
    DialogLabelItem = 42,
    DialogLabelMultiplayer = 43,
    DialogLabelNPC = 44,
    DialogLabelPlayer = 45,
    DialogLabelRecoverThresholds = 46,
    DialogLabelTerrain = 47,
    DialogModeSurvival = 48,
    DialogModeSurvivalTooltip = 49,
    DialogModeTidyUp = 50,
    DialogModeTidyUpTooltip = 51,
    DialogModeGardener = 52,
    DialogModeGardenerTooltip = 53,
    DialogModeTerminator = 54,
    DialogModeTerminatorTooltip = 55,
    DialogModeQuest = 56,
    DialogModeQuestTooltip = 57
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
