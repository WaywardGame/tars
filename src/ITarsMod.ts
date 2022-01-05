import { Events } from "event/EventEmitter";
import { IStatMax, Stat } from "game/entity/IStats";
import Translation from "language/Translation";
import Mod from "mod/Mod";
import { IContext } from "./core/context/IContext";
import { ITarsOptions } from "./core/ITars";
import TarsMod from "./TarsMod";

let tars: TarsMod | undefined;

export const TARS_ID = "TARS";

export function getTarsInstance() {
    if (!tars) {
        throw new Error("Invalid Tars instance");
    }

    return tars;
}

export function setTarsInstance(instance: TarsMod | undefined) {
    tars = instance;
}

export function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation {
    return getTarsInstance().getTranslation(translation);
}

export function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T] {
    return getTarsInstance().saveData[key];
}

export interface ITarsEvents extends Events<Mod> {
    /**
     * Emitted when TARS is enabled or disabled
     */
    enableChange(enabled: boolean): any;

    /**
     * Emitted when TARS options change
     */
    optionsChange(options: ITarsOptions): any;

    /**
     * Emitted when TARS status is changed
     */
    statusChange(status: Translation | string): any;
}

export interface ISaveData {
    enabled: boolean;
    configuredThresholds?: boolean;
    options: ITarsOptions;
    island: Record<string, Record<string, any>>;
    ui: Partial<Record<TarsUiSaveDataKey, any>>;
}

export enum TarsUiSaveDataKey {
    DialogOpened,
    ActivePanelId,
    AcquireItemDropdown,
    BuildDoodadDropdown,
    MoveToIslandDropdown,
    MoveToTerrainDropdown,
    MoveToDoodadDropdown,
    MoveToPlayerDropdown,
    MoveToNPCDropdown,
}

export enum TarsTranslation {
    DialogTitleMain,

    DialogStatusNavigatingInitializing,

    DialogPanelGeneral,
    DialogPanelTasks,
    DialogPanelMoveTo,
    DialogPanelOptions,

    DialogButtonEnable,
    DialogButtonAquireItem,
    DialogButtonAquireItemTooltip,
    DialogButtonBuildDoodad,
    DialogButtonBuildDoodadTooltip,
    DialogButtonExploreIslands,
    DialogButtonExploreIslandsTooltip,
    DialogButtonUseOrbsOfInfluence,
    DialogButtonUseOrbsOfInfluenceTooltip,
    DialogButtonStayHealthy,
    DialogButtonStayHealthyTooltip,
    DialogButtonDeveloperMode,
    DialogButtonDeveloperModeTooltip,
    DialogButtonQuantumBurst,
    DialogButtonQuantumBurstTooltip,

    DialogButtonMoveToBase,
    DialogButtonMoveToDoodad,
    DialogButtonMoveToIsland,
    DialogButtonMoveToNPC,
    DialogButtonMoveToPlayer,
    DialogButtonMoveToTerrain,

    DialogRangeLabel,
    DialogRangeRecoverHealthThreshold,
    DialogRangeRecoverHealthThresholdTooltip,
    DialogRangeRecoverStaminaThreshold,
    DialogRangeRecoverStaminaThresholdTooltip,
    DialogRangeRecoverHungerThreshold,
    DialogRangeRecoverHungerThresholdTooltip,
    DialogRangeRecoverThirstThreshold,
    DialogRangeRecoverThirstThresholdTooltip,

    DialogLabelAdvanced,
    DialogLabelDoodad,
    DialogLabelGeneral,
    DialogLabelIsland,
    DialogLabelItem,
    DialogLabelNPC,
    DialogLabelPlayer,
    DialogLabelRecoverThresholds,
    DialogLabelTerrain,

    DialogModeSurvival,
    DialogModeSurvivalTooltip,
    DialogModeTidyUp,
    DialogModeTidyUpTooltip,
    DialogModeGardener,
    DialogModeGardenerTooltip,
    DialogModeTerminator,
    DialogModeTerminatorTooltip,
    DialogModeQuest,
    DialogModeQuestTooltip,
}

// options to show in the Options panel
export interface ITarsOptionSection {
    option: keyof Omit<ITarsOptions, "mode">;
    title: TarsTranslation;
    tooltip: TarsTranslation;
    isDisabled?: () => boolean;
    slider?: {
        min: number | ((context: IContext) => number);
        max: number | ((context: IContext) => number)
    };
}

export const uiConfigurableOptions: Array<ITarsOptionSection | TarsTranslation | undefined> = [
    TarsTranslation.DialogLabelGeneral,
    {
        option: "exploreIslands",
        title: TarsTranslation.DialogButtonExploreIslands,
        tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
    },
    {
        option: "useOrbsOfInfluence",
        title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
        tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
    },
    {
        option: "stayHealthy",
        title: TarsTranslation.DialogButtonStayHealthy,
        tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
    },
    TarsTranslation.DialogLabelAdvanced,
    {
        option: "quantumBurst",
        title: TarsTranslation.DialogButtonQuantumBurst,
        tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
    },
    {
        option: "developerMode",
        title: TarsTranslation.DialogButtonDeveloperMode,
        tooltip: TarsTranslation.DialogButtonDeveloperModeTooltip,
    },
    TarsTranslation.DialogLabelRecoverThresholds,
    {
        option: "recoverThresholdHealth",
        title: TarsTranslation.DialogRangeRecoverHealthThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.player.stat.get<IStatMax>(Stat.Health).max,
        }
    },
    {
        option: "recoverThresholdStamina",
        title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.player.stat.get<IStatMax>(Stat.Stamina).max,
        }
    },
    {
        option: "recoverThresholdHunger",
        title: TarsTranslation.DialogRangeRecoverHungerThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.player.stat.get<IStatMax>(Stat.Hunger).max,
        }
    },
    {
        option: "recoverThresholdThirst",
        title: TarsTranslation.DialogRangeRecoverThirstThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.player.stat.get<IStatMax>(Stat.Thirst).max,
        }
    },
];
