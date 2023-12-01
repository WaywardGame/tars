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
import type { ActionType } from "@wayward/game/game/entity/action/IAction";
import type { DamageType } from "@wayward/game/game/entity/IEntity";
import { ItemType } from "@wayward/game/game/item/IItem";
import type { ILog, ILogLine } from "@wayward/utilities/Log";
import { IVector3 } from "@wayward/game/utilities/math/IVector";
import { LoggerUtilities } from "../../utilities/LoggerUtilities";
import type Context from "../context/Context";
import type ContextState from "../context/ContextState";
import type { IExecutionTree } from "../planning/IPlan";
export declare enum ObjectiveResult {
    Complete = -1,
    Pending = -2,
    Ignore = -3,
    Restart = -4,
    Impossible = -5
}
export type ObjectiveExecutionResult = IObjective | IObjective[] | IObjective[][] | ObjectiveResult | number;
export declare enum CalculatedDifficultyStatus {
    Impossible = -5,
    NotCalculatedYet = -6,
    NotPlausible = -7,
    Possible = -26
}
export interface IObjectivePriority {
    totalCraftObjectives: number;
    readyToCraftObjectives: number;
    useProvidedItemObjectives: number;
    totalGatherObjectives: number;
    gatherObjectives: Record<"GatherFromCreature" | "GatherFromCorpse" | "GatherFromGround" | "GatherFromTerrainResource" | "GatherFromDoodad" | "GatherFromChest", number>;
}
export interface IObjective {
    readonly log: ILog;
    readonly ignoreInvalidPlans?: boolean;
    readonly includePositionInHashCode?: boolean;
    enableLogging: boolean;
    ensureLogger(loggerUtilities: LoggerUtilities): void;
    setLogger(log: ILog | undefined): void;
    execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult>;
    getHashCode(context: Context | undefined, skipContextDataKey?: boolean): string;
    getIdentifier(context: Context | undefined): string;
    getName(): string;
    getStatusMessage(context: Context): string | undefined;
    getExecutionPriority?(context: Context, tree: IExecutionTree): IObjectivePriority;
    getPosition?(): IVector3;
    isDynamic(): boolean;
    getDifficulty(context: Context): number;
    isDifficultyOverridden(): boolean;
    onMove(context: Context): Promise<IObjective | boolean>;
    canIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean | HashCodeFiltering;
    shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean;
    canSaveChildObjectives(): boolean;
    canGroupTogether(): boolean;
}
export interface IHandsEquipment {
    use: ActionType;
    preferredDamageType?: DamageType;
}
interface IBaseObjectivePipeline {
    status: CalculatedDifficultyStatus;
    changes?: ContextState;
}
export type ImpossibleObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.Impossible;
};
export type NotPlausibleObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.NotPlausible;
    hashCode: string;
    minimumDifficulty: number;
};
export type NotCalculatedYetObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.NotCalculatedYet;
    hashCode: string;
    waitingHashCodes: Set<string>;
};
export type PossibleObjectivePipeline = Required<IBaseObjectivePipeline> & {
    status: CalculatedDifficultyStatus.Possible;
    depth: number;
    objectives: IObjective[];
    objectiveChain: IObjectiveInfo[];
    difficulty: number;
};
export type ObjectivePipeline = ImpossibleObjectivePipeline | NotCalculatedYetObjectivePipeline | PossibleObjectivePipeline | NotPlausibleObjectivePipeline;
export interface IObjectiveInfo {
    depth: number;
    objective: IObjective;
    difficulty: number;
    logs: ILogLine[];
}
export type HashCodeFiltering = Set<ItemType> | {
    objectiveHashCode: string;
    itemTypes: Set<ItemType>;
};
export {};
