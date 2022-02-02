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
    DialogButtonDeveloperMode = 11,
    DialogButtonDeveloperModeTooltip = 12,
    DialogButtonEnable = 13,
    DialogButtonExploreIslands = 14,
    DialogButtonExploreIslandsTooltip = 15,
    DialogButtonGoodCitizen = 16,
    DialogButtonGoodCitizenTooltip = 17,
    DialogButtonQuantumBurst = 18,
    DialogButtonQuantumBurstTooltip = 19,
    DialogButtonStayHealthy = 20,
    DialogButtonStayHealthyTooltip = 21,
    DialogButtonUseOrbsOfInfluence = 22,
    DialogButtonUseOrbsOfInfluenceTooltip = 23,
    DialogButtonSailToCivilization = 24,
    DialogButtonSailToCivilizationTooltip = 25,
    DialogButtonTameCreature = 26,
    DialogButtonTameCreatureTooltip = 27,
    DialogButtonMoveToBase = 28,
    DialogButtonMoveToDoodad = 29,
    DialogButtonMoveToIsland = 30,
    DialogButtonMoveToNPC = 31,
    DialogButtonMoveToCreature = 32,
    DialogButtonMoveToPlayer = 33,
    DialogButtonMoveToTerrain = 34,
    DialogRangeLabel = 35,
    DialogRangeRecoverHealthThreshold = 36,
    DialogRangeRecoverHealthThresholdTooltip = 37,
    DialogRangeRecoverStaminaThreshold = 38,
    DialogRangeRecoverStaminaThresholdTooltip = 39,
    DialogRangeRecoverHungerThreshold = 40,
    DialogRangeRecoverHungerThresholdTooltip = 41,
    DialogRangeRecoverThirstThreshold = 42,
    DialogRangeRecoverThirstThresholdTooltip = 43,
    DialogLabelAdvanced = 44,
    DialogLabelDoodad = 45,
    DialogLabelGeneral = 46,
    DialogLabelIsland = 47,
    DialogLabelItem = 48,
    DialogLabelMultiplayer = 49,
    DialogLabelNPC = 50,
    DialogLabelPlayer = 51,
    DialogLabelRecoverThresholds = 52,
    DialogLabelTerrain = 53,
    DialogLabelCreature = 54,
    DialogModeGardener = 55,
    DialogModeGardenerTooltip = 56,
    DialogModeHarvester = 57,
    DialogModeHarvesterTooltip = 58,
    DialogModeQuest = 59,
    DialogModeQuestTooltip = 60,
    DialogModeSurvival = 61,
    DialogModeSurvivalTooltip = 62,
    DialogModeTerminator = 63,
    DialogModeTerminatorTooltip = 64,
    DialogModeTidyUp = 65,
    DialogModeTidyUpTooltip = 66
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
