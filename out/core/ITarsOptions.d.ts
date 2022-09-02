import { TreasureHunterType } from "../modes/TreasureHunter";
import { TarsMode } from "./ITars";
export interface ITarsOptions {
    mode: TarsMode;
    stayHealthy: boolean;
    allowCaves: boolean;
    allowBackpacks: boolean;
    lockInventory: boolean;
    lockEquipment: boolean;
    useProtectedItems: TarsUseProtectedItems;
    useProtectedItemsForEquipment: boolean;
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
    gardenerOnlyEdiblePlants: boolean;
    harvesterOnlyUseHands: boolean;
    treasureHunterPrecognition: boolean;
    treasureHunterType: TreasureHunterType;
    planningAccuracy: PlanningAccuracy;
    quantumBurst: boolean;
    debugLogging: boolean;
    navigationOverlays: boolean;
    freeze: boolean;
}
export declare enum TarsUseProtectedItems {
    No = 0,
    Yes = 1,
    YesWithBreakCheck = 2
}
export declare enum PlanningAccuracy {
    Simple = 0,
    Accurate = 1
}
export declare function createOptions(initialOptions?: Partial<ITarsOptions>): ITarsOptions;
