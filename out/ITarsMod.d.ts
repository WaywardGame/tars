import { Events } from "event/EventEmitter";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { IContext } from "./core/context/IContext";
import { ITarsOptions } from "./core/ITars";
import TarsMod from "./TarsMod";
export declare const TARS_ID = "TARS";
export declare function getTarsInstance(): TarsMod;
export declare function setTarsInstance(instance: TarsMod | undefined): void;
export declare function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation;
export declare function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T];
export interface ITarsEvents extends Events<Mod> {
    enableChange(enabled: boolean): any;
    optionsChange(options: ITarsOptions): any;
    statusChange(status: Translation | string): any;
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
    DialogButtonEnable = 6,
    DialogButtonAquireItem = 7,
    DialogButtonAquireItemTooltip = 8,
    DialogButtonBuildDoodad = 9,
    DialogButtonBuildDoodadTooltip = 10,
    DialogButtonExploreIslands = 11,
    DialogButtonExploreIslandsTooltip = 12,
    DialogButtonUseOrbsOfInfluence = 13,
    DialogButtonUseOrbsOfInfluenceTooltip = 14,
    DialogButtonStayHealthy = 15,
    DialogButtonStayHealthyTooltip = 16,
    DialogButtonDeveloperMode = 17,
    DialogButtonDeveloperModeTooltip = 18,
    DialogButtonQuantumBurst = 19,
    DialogButtonQuantumBurstTooltip = 20,
    DialogButtonMoveToBase = 21,
    DialogButtonMoveToDoodad = 22,
    DialogButtonMoveToIsland = 23,
    DialogButtonMoveToNPC = 24,
    DialogButtonMoveToPlayer = 25,
    DialogButtonMoveToTerrain = 26,
    DialogRangeLabel = 27,
    DialogRangeRecoverHealthThreshold = 28,
    DialogRangeRecoverHealthThresholdTooltip = 29,
    DialogRangeRecoverStaminaThreshold = 30,
    DialogRangeRecoverStaminaThresholdTooltip = 31,
    DialogRangeRecoverHungerThreshold = 32,
    DialogRangeRecoverHungerThresholdTooltip = 33,
    DialogRangeRecoverThirstThreshold = 34,
    DialogRangeRecoverThirstThresholdTooltip = 35,
    DialogLabelAdvanced = 36,
    DialogLabelDoodad = 37,
    DialogLabelGeneral = 38,
    DialogLabelIsland = 39,
    DialogLabelItem = 40,
    DialogLabelNPC = 41,
    DialogLabelPlayer = 42,
    DialogLabelRecoverThresholds = 43,
    DialogLabelTerrain = 44,
    DialogModeSurvival = 45,
    DialogModeSurvivalTooltip = 46,
    DialogModeTidyUp = 47,
    DialogModeTidyUpTooltip = 48,
    DialogModeGardener = 49,
    DialogModeGardenerTooltip = 50,
    DialogModeTerminator = 51,
    DialogModeTerminatorTooltip = 52,
    DialogModeQuest = 53,
    DialogModeQuestTooltip = 54
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
