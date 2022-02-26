import { TreasureHunterType } from "../modes/TreasureHunter";
import { TarsMode } from "./ITars";
export interface ITarsOptions {
    mode: TarsMode;
    stayHealthy: boolean;
    allowCaves: boolean;
    useProtectedItems: TarsUseProtectedItems;
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
    harvestOnlyUseHands: boolean;
    treasureHunterPrecognition: boolean;
    treasureHunterType: TreasureHunterType;
    quantumBurst: boolean;
    debugLogging: boolean;
    freeze: boolean;
    fasterPlanning: boolean;
}
export declare enum TarsUseProtectedItems {
    No = 0,
    Yes = 1,
    YesWithBreakCheck = 2
}
export declare function createOptions(initialOptions?: Partial<ITarsOptions>): ITarsOptions;
