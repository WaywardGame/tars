import type { Events } from "event/EventEmitter";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import type { IContext } from "./core/context/IContext";
import type { ITarsOptions } from "./core/ITars";
import type TarsMod from "./TarsMod";

export const TARS_ID = "TARS";

let tarsMod: TarsMod | undefined;

export function getTarsMod(): TarsMod {
    if (!tarsMod) {
        throw new Error("Invalid Tars instance");
    }

    return tarsMod;
}

export function setTarsMod(instance: TarsMod | undefined) {
    tarsMod = instance;
}

export function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation {
    return getTarsMod().getTranslation(translation);
}

export function getTarsSaveData<T extends keyof ISaveData>(key: T): ISaveData[T] {
    return getTarsMod().saveData[key];
}

export interface ITarsModEvents extends Events<Mod> {
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
    statusChange(status: TarsTranslation | string): any;
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

    DialogButtonAquireItem,
    DialogButtonAquireItemTooltip,
    DialogButtonBuildDoodad,
    DialogButtonBuildDoodadTooltip,
    DialogButtonDeveloperMode,
    DialogButtonDeveloperModeTooltip,
    DialogButtonEnable,
    DialogButtonExploreIslands,
    DialogButtonExploreIslandsTooltip,
    DialogButtonGoodCitizen,
    DialogButtonGoodCitizenTooltip,
    DialogButtonQuantumBurst,
    DialogButtonQuantumBurstTooltip,
    DialogButtonStayHealthy,
    DialogButtonStayHealthyTooltip,
    DialogButtonUseOrbsOfInfluence,
    DialogButtonUseOrbsOfInfluenceTooltip,
    DialogButtonSailToCivilization,
    DialogButtonSailToCivilizationTooltip,

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
    DialogLabelMultiplayer,
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
        max: number | ((context: IContext) => number);
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
    TarsTranslation.DialogLabelMultiplayer,
    {
        option: "goodCitizen",
        title: TarsTranslation.DialogButtonGoodCitizen,
        tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
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
