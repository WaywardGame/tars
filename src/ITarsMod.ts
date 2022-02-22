import type { Events } from "event/EventEmitter";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Translation from "language/Translation";
import type Mod from "mod/Mod";

import { ITarsOptions, TarsUseProtectedItems } from "./core/ITarsOptions";
import type { IContext } from "./core/context/IContext";
import { TreasureHunterType } from "./modes/TreasureHunter";
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
    DialogPanelGlobalOptions,
    DialogPanelModeOptions,

    DialogButtonAllowProtectedItems,
    DialogButtonAllowProtectedItemsTooltip,
    DialogButtonAllowProtectedItemsWithBreakCheck,
    DialogButtonAllowProtectedItemsWithBreakCheckTooltip,
    DialogButtonAquireItem,
    DialogButtonAquireItemTooltip,
    DialogButtonBuildDoodad,
    DialogButtonBuildDoodadTooltip,
    DialogButtonDebugLogging,
    DialogButtonDebugLoggingTooltip,
    DialogButtonDisallowProtectedItems,
    DialogButtonDisallowProtectedItemsTooltip,
    DialogButtonDiscoverAndUnlockTreasure,
    DialogButtonDiscoverAndUnlockTreasureTooltip,
    DialogButtonEnable,
    DialogButtonExploreIslands,
    DialogButtonExploreIslandsTooltip,
    DialogButtonFreeze,
    DialogButtonFreezeTooltip,
    DialogButtonGoodCitizen,
    DialogButtonGoodCitizenTooltip,
    DialogButtonHarvesterOnlyUseHands,
    DialogButtonHarvesterOnlyUseHandsTooltip,
    DialogButtonObtainTreasure,
    DialogButtonObtainTreasureTooltip,
    DialogButtonOnlyDiscoverTreasure,
    DialogButtonOnlyDiscoverTreasureTooltip,
    DialogButtonPrecognition,
    DialogButtonPrecognitionTooltip,
    DialogButtonQuantumBurst,
    DialogButtonQuantumBurstTooltip,
    DialogButtonReadBooks,
    DialogButtonReadBooksTooltip,
    DialogButtonClearSwamps,
    DialogButtonClearSwampsTooltip,
    DialogButtonOrganizeBase,
    DialogButtonOrganizeBaseTooltip,
    DialogButtonSailToCivilization,
    DialogButtonSailToCivilizationTooltip,
    DialogButtonStayHealthy,
    DialogButtonStayHealthyTooltip,
    DialogButtonTameCreature,
    DialogButtonTameCreatureTooltip,
    DialogButtonUseOrbsOfInfluence,
    DialogButtonUseOrbsOfInfluenceTooltip,

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
    DialogLabelItemProtection,
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
    DialogModeTreasureHunter,
    DialogModeTreasureHunterTooltip,
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

export const uiConfigurableGlobalOptions: Array<TarsOptionSection | TarsTranslation | undefined> = [
    TarsTranslation.DialogLabelGeneral,
    {
        option: "stayHealthy",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonStayHealthy,
        tooltip: TarsTranslation.DialogButtonStayHealthyTooltip,
    },
    TarsTranslation.DialogLabelItemProtection,
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

export const uiConfigurableModeOptions: Array<TarsOptionSection | TarsTranslation | undefined> = [
    TarsTranslation.DialogModeSurvival,
    {
        option: "survivalExploreIslands",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonExploreIslands,
        tooltip: TarsTranslation.DialogButtonExploreIslandsTooltip,
    },
    {
        option: "survivalUseOrbsOfInfluence",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonUseOrbsOfInfluence,
        tooltip: TarsTranslation.DialogButtonUseOrbsOfInfluenceTooltip,
    },
    {
        option: "survivalReadBooks",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonReadBooks,
        tooltip: TarsTranslation.DialogButtonReadBooksTooltip,
    },
    {
        option: "survivalClearSwamps",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonClearSwamps,
        tooltip: TarsTranslation.DialogButtonClearSwampsTooltip,
    },
    {
        option: "survivalOrganizeBase",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonOrganizeBase,
        tooltip: TarsTranslation.DialogButtonOrganizeBaseTooltip,
    },
    TarsTranslation.DialogModeHarvester,
    {
        option: "harvestOnlyUseHands",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonHarvesterOnlyUseHands,
        tooltip: TarsTranslation.DialogButtonHarvesterOnlyUseHandsTooltip,
    },
    TarsTranslation.DialogModeTreasureHunter,
    {
        option: "treasureHunterPrecognition",
        type: TarsOptionSectionType.Checkbox,
        title: TarsTranslation.DialogButtonPrecognition,
        tooltip: TarsTranslation.DialogButtonPrecognitionTooltip,
    },
    {
        option: "treasureHunterType",
        type: TarsOptionSectionType.Choice,
        choices: [
            [TarsTranslation.DialogButtonOnlyDiscoverTreasure, TarsTranslation.DialogButtonOnlyDiscoverTreasureTooltip, TreasureHunterType.OnlyDiscoverTreasure],
            [TarsTranslation.DialogButtonDiscoverAndUnlockTreasure, TarsTranslation.DialogButtonDiscoverAndUnlockTreasureTooltip, TreasureHunterType.DiscoverAndUnlockTreasure],
            [TarsTranslation.DialogButtonObtainTreasure, TarsTranslation.DialogButtonObtainTreasureTooltip, TreasureHunterType.ObtainTreasure],
        ],
    },
];
