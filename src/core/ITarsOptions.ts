import Deity from "@wayward/game/game/deity/Deity";
import { TreasureHunterType } from "../modes/TreasureHunter";
import { TarsMode } from "./ITars";

/**
 * List of options
 */
export interface ITarsOptions {
	mode: TarsMode;

	stayHealthy: boolean;
	allowCaves: boolean;
	allowBackpacks: boolean;

	lockInventory: boolean;
	lockEquipment: boolean;
	useProtectedItems: TarsUseProtectedItems;
	useProtectedItemsForEquipment: boolean;

	deity: Deity | null;

	goodCitizen: boolean;

	recoverThresholdHealth: number;
	recoverThresholdStamina: number;
	recoverThresholdHunger: number;
	recoverThresholdThirst: number;
	recoverThresholdThirstFromMax: number;

	survivalExploreIslands: boolean;
	survivalUseOrbsOfInfluence: boolean;
	survivalReadBooks: boolean;
	survivalClearSwamps: boolean;
	survivalOrganizeBase: boolean;
	survivalStartWaterSources: boolean;
	survivalMaintainLowDifficulty: boolean;

	gardenerOnlyEdiblePlants: boolean;

	harvesterOnlyUseHands: boolean;

	treasureHunterPrecognition: boolean;
	treasureHunterType: TreasureHunterType;

	planningAccuracy: PlanningAccuracy;

	quantumBurst: boolean;

	limitGroundItemSearch: boolean;
	limitDisassembleItemSearch: boolean;

	debugLogging: boolean;
	navigationOverlays: boolean;
	freeze: boolean;
	preventNotes: boolean;
}

export enum TarsUseProtectedItems {
	No,
	Yes,
	YesWithBreakCheck,
}

export enum PlanningAccuracy {
	Simple,
	Accurate,
}

export function createOptions(initialOptions: Partial<ITarsOptions> = {}): ITarsOptions {
	return {
		mode: TarsMode.Survival,

		stayHealthy: true,
		allowCaves: false,
		allowBackpacks: true,

		lockInventory: false,
		lockEquipment: false,
		useProtectedItems: TarsUseProtectedItems.No,
		useProtectedItemsForEquipment: true,

		deity: Deity.Chaos,

		goodCitizen: isWebWorker ? false : true,

		recoverThresholdHealth: 30,
		recoverThresholdStamina: 20,
		recoverThresholdHunger: 8,
		recoverThresholdThirst: 10,
		recoverThresholdThirstFromMax: -10,

		survivalExploreIslands: true,
		survivalUseOrbsOfInfluence: true,
		survivalReadBooks: true,
		survivalClearSwamps: true,
		survivalOrganizeBase: true,
		survivalStartWaterSources: true,
		survivalMaintainLowDifficulty: false,

		gardenerOnlyEdiblePlants: true,

		harvesterOnlyUseHands: false,

		treasureHunterPrecognition: false,
		treasureHunterType: TreasureHunterType.DiscoverAndUnlockTreasure,

		planningAccuracy: PlanningAccuracy.Accurate,

		limitGroundItemSearch: true,
		limitDisassembleItemSearch: true,

		quantumBurst: false,

		debugLogging: false,
		navigationOverlays: false,
		freeze: false,
		preventNotes: true,

		...initialOptions,
	};
}