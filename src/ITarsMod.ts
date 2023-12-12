/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type { Events } from "@wayward/utilities/event/EventEmitter";
import type { IStatMax } from "@wayward/game/game/entity/IStats";
import { Stat } from "@wayward/game/game/entity/IStats";
import type { IslandId } from "@wayward/game/game/island/IIsland";
import type Translation from "@wayward/game/language/Translation";
import type Mod from "@wayward/game/mod/Mod";

import { Reference } from "@wayward/game/game/reference/IReferenceManager";
import type { IContext } from "./core/context/IContext";
import { ITarsOptions, PlanningAccuracy, TarsUseProtectedItems } from "./core/ITarsOptions";
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

export function setTarsMod(instance: TarsMod | undefined): void {
	tarsMod = instance;
}

export function getTarsTranslation(translation: TarsTranslation | string | Translation): Translation {
	return getTarsMod().getTranslation(translation);
}

export interface ITarsModEvents extends Events<Mod> {
	/**
	 * Emitted when TARS status is changed
	 */
	statusChange(): any;

	refreshTarsInstanceReferences(): any;

	changedGlobalDataSlots(): any;
}

export interface IGlobalSaveData {
	dataSlots: ISaveDataContainer[];
}

export interface ISaveDataContainer {
	name: string;
	version: string;
	saveData: ISaveData;
}

export interface ISaveData {
	enabled: boolean;
	configuredThresholds?: boolean;
	options: ITarsOptions;
	island: Record<IslandId, Record<string, any>>;
	ui: Partial<Record<TarsUiSaveDataKey, any>>;
	instanceIslandIds: Map<IslandId, Reference[]>;
}

export enum TarsUiSaveDataKey {
	DialogsOpened,
	ActivePanelId,
	AcquireItemDropdown,
	BuildDoodadDropdown,
	MoveToIslandDropdown,
	MoveToTerrainDropdown,
	MoveToDoodadDropdown,
	MoveToCreatureDropdown,
	MoveToPlayerDropdown,
	MoveToNPCTypeDropdown,
	TameCreatureDropdown,
}


export enum TarsTranslation {
	Name,
	NpcName,

	DialogTitleMain,

	DialogStatusNavigatingInitializing,

	DialogPanelGeneral,
	DialogPanelNPCs,
	DialogPanelViewport,
	DialogPanelTasks,
	DialogPanelData,
	DialogPanelMoveTo,
	DialogPanelGlobalOptions,
	DialogPanelModeOptions,

	DialogButtonSimple,
	DialogButtonSimpleTooltip,
	DialogButtonAccurate,
	DialogButtonAccurateTooltip,
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
	DialogButtonNavigationOverlays,
	DialogButtonNavigationOverlaysTooltip,
	DialogButtonDisallowProtectedItems,
	DialogButtonDisallowProtectedItemsTooltip,
	DialogButtonAllowProtectedItemsForEquipment,
	DialogButtonAllowProtectedItemsForEquipmentTooltip,
	DialogButtonDiscoverAndUnlockTreasure,
	DialogButtonDiscoverAndUnlockTreasureTooltip,
	DialogButtonEnable,
	DialogButtonRename,
	DialogButtonExploreIslands,
	DialogButtonExploreIslandsTooltip,
	DialogButtonFreeze,
	DialogButtonFreezeTooltip,
	DialogButtonGoodCitizen,
	DialogButtonGoodCitizenTooltip,
	DialogButtonGardenerOnlyEdiblePlants,
	DialogButtonGardenerOnlyEdiblePlantsTooltip,
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
	DialogButtonLimitGroundItemSearch,
	DialogButtonLimitGroundItemSearchTooltip,
	DialogButtonLimitDisassembleItemSearch,
	DialogButtonLimitDisassembleItemSearchTooltip,
	DialogButtonAllowCaves,
	DialogButtonAllowCavesTooltip,
	DialogButtonLockInventory,
	DialogButtonLockInventoryTooltip,
	DialogButtonLockEquipment,
	DialogButtonLockEquipmentTooltip,
	DialogButtonReadBooks,
	DialogButtonReadBooksTooltip,
	DialogButtonClearSwamps,
	DialogButtonClearSwampsTooltip,
	DialogButtonOrganizeBase,
	DialogButtonOrganizeBaseTooltip,
	DialogButtonAllowBackpacks,
	DialogButtonAllowBackpacksTooltip,
	DialogButtonMaintainLowDifficulty,
	DialogButtonMaintainLowDifficultyTooltip,
	DialogButtonSailToCivilization,
	DialogButtonSailToCivilizationTooltip,
	DialogButtonStayHealthy,
	DialogButtonStayHealthyTooltip,
	DialogButtonTameCreature,
	DialogButtonTameCreatureTooltip,
	DialogButtonUseOrbsOfInfluence,
	DialogButtonUseOrbsOfInfluenceTooltip,
	DialogButtonSpawnNPC,
	DialogButtonSpawnNPCTooltip,
	DialogButtonLoadTooltip,
	DialogButtonRenameTooltip,
	DialogButtonConfigurationTooltip,
	DialogButtonDeleteTooltip,
	DialogButtonSaveData,
	DialogButtonSaveDataTooltip,
	DialogButtonImportData,
	DialogButtonImportDataTooltip,
	DialogButtonExportTooltip,

	DialogButtonMoveToBase,
	DialogButtonMoveToDoodad,
	DialogButtonMoveToIsland,
	DialogButtonMoveToNPC,
	DialogButtonMoveToCreature,
	DialogButtonMoveToPlayer,
	DialogButtonMoveToTerrain,
	DialogButtonFollowPlayer,
	DialogButtonFollowNPC,

	DialogLabel,
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
	DialogLabelPlanningAccuracy,

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
	DialogModeAngler,
	DialogModeAnglerTooltip,
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
	{
		option: "allowCaves",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonAllowCaves,
		tooltip: TarsTranslation.DialogButtonAllowCavesTooltip,
	},
	{
		option: "allowBackpacks",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonAllowBackpacks,
		tooltip: TarsTranslation.DialogButtonAllowBackpacksTooltip,
	},
	TarsTranslation.DialogLabelItemProtection,
	// {
	//     option: "lockInventory",
	//     type: TarsOptionSectionType.Checkbox,
	//     title: TarsTranslation.DialogButtonLockInventory,
	//     tooltip: TarsTranslation.DialogButtonLockInventoryTooltip,
	// },
	{
		option: "lockEquipment",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonLockEquipment,
		tooltip: TarsTranslation.DialogButtonLockEquipmentTooltip,
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
	{
		option: "useProtectedItemsForEquipment",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonAllowProtectedItemsForEquipment,
		tooltip: TarsTranslation.DialogButtonAllowProtectedItemsForEquipmentTooltip,
	},
	TarsTranslation.DialogLabelMultiplayer,
	{
		option: "goodCitizen",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonGoodCitizen,
		tooltip: TarsTranslation.DialogButtonGoodCitizenTooltip,
	},
	TarsTranslation.DialogLabelPlanningAccuracy,
	{
		option: "planningAccuracy",
		type: TarsOptionSectionType.Choice,
		choices: [
			[TarsTranslation.DialogButtonSimple, TarsTranslation.DialogButtonSimpleTooltip, PlanningAccuracy.Simple],
			[TarsTranslation.DialogButtonAccurate, TarsTranslation.DialogButtonAccurateTooltip, PlanningAccuracy.Accurate],
		],
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
	{
		option: "navigationOverlays",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonNavigationOverlays,
		tooltip: TarsTranslation.DialogButtonNavigationOverlaysTooltip,
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
	TarsTranslation.DialogLabelAdvanced,
	{
		option: "quantumBurst",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonQuantumBurst,
		tooltip: TarsTranslation.DialogButtonQuantumBurstTooltip,
	},
	{
		option: "limitGroundItemSearch",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonLimitGroundItemSearch,
		tooltip: TarsTranslation.DialogButtonLimitGroundItemSearchTooltip,
	},
	{
		option: "limitDisassembleItemSearch",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonLimitDisassembleItemSearch,
		tooltip: TarsTranslation.DialogButtonLimitDisassembleItemSearchTooltip,
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
	{
		option: "survivalMaintainLowDifficulty",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonMaintainLowDifficulty,
		tooltip: TarsTranslation.DialogButtonMaintainLowDifficultyTooltip,
	},
	TarsTranslation.DialogModeGardener,
	{
		option: "gardenerOnlyEdiblePlants",
		type: TarsOptionSectionType.Checkbox,
		title: TarsTranslation.DialogButtonGardenerOnlyEdiblePlants,
		tooltip: TarsTranslation.DialogButtonGardenerOnlyEdiblePlantsTooltip,
	},
	TarsTranslation.DialogModeHarvester,
	{
		option: "harvesterOnlyUseHands",
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
