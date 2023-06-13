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
    survivalMaintainLowDifficulty: boolean;
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
