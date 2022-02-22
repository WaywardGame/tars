
import { TreasureHunterType } from "../modes/TreasureHunter";
import { TarsMode } from "./ITars";

/**
 * List of options
 */
export interface ITarsOptions {
    mode: TarsMode;

    useProtectedItems: TarsUseProtectedItems;

    goodCitizen: boolean;

    stayHealthy: boolean;
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
}

export enum TarsUseProtectedItems {
    No,
    Yes,
    YesWithBreakCheck,
}

export function createOptions(initialOptions: Partial<ITarsOptions> = {}): ITarsOptions {
    return {
        mode: TarsMode.Survival,

        useProtectedItems: TarsUseProtectedItems.No,
        goodCitizen: true,
        stayHealthy: true,

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

        harvestOnlyUseHands: false,

        treasureHunterPrecognition: false,
        treasureHunterType: TreasureHunterType.DiscoverAndUnlockTreasure,

        quantumBurst: false,
        debugLogging: false,
        freeze: false,
        ...initialOptions,
    };
}