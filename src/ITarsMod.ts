import type { Events } from "event/EventEmitter";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";
import type { IContext } from "./core/context/IContext";
import { ITarsOptions, TarsUseProtectedItems } from "./core/ITars";
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
    MoveToCreatureDropdown,
    MoveToPlayerDropdown,
    MoveToNPCDropdown,
    TameCreatureDropdown,
}

export enum TarsTranslation {
    Name,

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
    DialogButtonDebugLogging,
    DialogButtonDebugLoggingTooltip,
    DialogButtonFreeze,
    DialogButtonFreezeTooltip,
    DialogButtonEnable,
    DialogButtonExploreIslands,
    DialogButtonExploreIslandsTooltip,
    DialogButtonGoodCitizen,
    DialogButtonGoodCitizenTooltip,
    DialogButtonQuantumBurst,
    DialogButtonQuantumBurstTooltip,
    DialogButtonStayHealthy,
    DialogButtonStayHealthyTooltip,
    DialogButtonDisallowProtectedItems,
    DialogButtonDisallowProtectedItemsTooltip,
    DialogButtonAllowProtectedItems,
    DialogButtonAllowProtectedItemsTooltip,
    DialogButtonAllowProtectedItemsWithBreakCheck,
    DialogButtonAllowProtectedItemsWithBreakCheckTooltip,
    DialogButtonUseOrbsOfInfluence,
    DialogButtonUseOrbsOfInfluenceTooltip,
    DialogButtonReadBooks,
    DialogButtonReadBooksTooltip,
    DialogButtonSailToCivilization,
    DialogButtonSailToCivilizationTooltip,
    DialogButtonTameCreature,
    DialogButtonTameCreatureTooltip,

    DialogButtonMoveToBase,
    DialogButtonMoveToDoodad,
    DialogButtonMoveToIsland,
    DialogButtonMoveToNPC,
    DialogButtonMoveToCreature,
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
    DialogLabelCreature,
    DialogLabelDeveloper,
    DialogLabelDoodad,
    DialogLabelGeneral,
    DialogLabelIsland,
    DialogLabelItem,
    DialogLabelMultiplayer,
    DialogLabelNPC,
    DialogLabelPlayer,
    DialogLabelRecoverThresholds,
    DialogLabelTerrain,

    DialogModeGardener,
    DialogModeGardenerTooltip,
    DialogModeHarvester,
    DialogModeHarvesterTooltip,
    DialogModeQuest,
    DialogModeQuestTooltip,
    DialogModeSurvival,
    DialogModeSurvivalTooltip,
    DialogModeTerminator,
    DialogModeTerminatorTooltip,
    DialogModeTidyUp,
    DialogModeTidyUpTooltip,
}

export enum TarsOptionSectionType {
    Checkbox,
    Choice,
    Slider,
}

// options to show in the Options panel
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

export type TarsOptionSection = ITarsCheckboxOptionSection | ITarsChoiceOptionSection | ITarsSliderOptionSection;

export const uiConfigurableOptions: Array<TarsOptionSection | TarsTranslation | undefined> = [
    TarsTranslation.DialogLabelGeneral,
    {
        option: "exploreIslands",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonExploreIslands,
        tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
    },
    {
        option: "stayHealthy",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonStayHealthy,
        tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
    },
    {
        option: "useOrbsOfInfluence",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
        tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
    },
    {
        option: "readBooks",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonReadBooks,
        tooltip: TarsTranslation.DialogButtonReadBooksTooltip,
    },
    {
        option: "useProtectedItems",
        type: TarsOptionSectionType.Choice,
        choices: [
            [TarsTranslation.DialogButtonDisallowProtectedItems, TarsTranslation.DialogButtonDisallowProtectedItemsTooltip, TarsUseProtectedItems.No],
            [TarsTranslation.DialogButtonAllowProtectedItems, TarsTranslation.DialogButtonAllowProtectedItemsTooltip, TarsUseProtectedItems.Yes],
            [TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheck, TarsTranslation.DialogButtonAllowProtectedItemsWithBreakCheckTooltip, TarsUseProtectedItems.YesWithBreakCheck],
        ],
    },
    TarsTranslation.DialogLabelMultiplayer,
    {
        option: "goodCitizen",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonGoodCitizen,
        tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
    },
    TarsTranslation.DialogLabelAdvanced,
    {
        option: "quantumBurst",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonQuantumBurst,
        tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
    },
    TarsTranslation.DialogLabelDeveloper,
    {
        option: "debugLogging",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonDebugLogging,
        tooltip: TarsTranslation.DialogButtonDebugLoggingTooltip,
    },
    {
        option: "freeze",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonFreeze,
        tooltip: TarsTranslation.DialogButtonFreezeTooltip,
    },
    TarsTranslation.DialogLabelRecoverThresholds,
    {
        option: "recoverThresholdHealth",
        type: TarsOptionSectionType.Slider,
        title: TarsTranslation.DialogRangeRecoverHealthThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverHealthThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.human.stat.get<IStatMax>(Stat.Health).max,
        }
    },
    {
        option: "recoverThresholdStamina",
        type: TarsOptionSectionType.Slider,
        title: TarsTranslation.DialogRangeRecoverStaminaThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverStaminaThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.human.stat.get<IStatMax>(Stat.Stamina).max,
        }
    },
    {
        option: "recoverThresholdHunger",
        type: TarsOptionSectionType.Slider,
        title: TarsTranslation.DialogRangeRecoverHungerThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverHungerThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.human.stat.get<IStatMax>(Stat.Hunger).max,
        }
    },
    {
        option: "recoverThresholdThirst",
        type: TarsOptionSectionType.Slider,
        title: TarsTranslation.DialogRangeRecoverThirstThreshold,
        tooltip: TarsTranslation.DialogRangeRecoverThirstThresholdTooltip,
        slider: {
            min: 0,
            max: (context) => context.human.stat.get<IStatMax>(Stat.Thirst).max,
        }
    },
];
