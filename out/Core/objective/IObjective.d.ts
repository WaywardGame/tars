import type { ActionType } from "game/entity/action/IAction";
import type { DamageType } from "game/entity/IEntity";
import { ItemType } from "game/item/IItem";
import type { ILog, ILogLine } from "utilities/Log";
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
export declare type ObjectiveExecutionResult = IObjective | IObjective[] | IObjective[][] | ObjectiveResult | number;
export declare enum CalculatedDifficultyStatus {
    Impossible = -5,
    NotCalculatedYet = -6,
    NotPlausible = -7,
    Possible = -26
}
export interface IObjectivePriority {
    priority: number;
    objectiveCount: number;
    acquireObjectiveCount: number;
    emptyAcquireObjectiveCount: number;
    gatherObjectiveCount: number;
    gatherWithoutChestObjectiveCount: number;
    craftsRequiringNoGatheringCount: number;
    regroupedChildrenCount: number;
}
export interface IObjective {
    readonly log: ILog;
    readonly ignoreInvalidPlans?: boolean;
    readonly gatherObjectivePriority?: number;
    enableLogging: boolean;
    setLogger(log: ILog | undefined): void;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    getHashCode(context: Context | undefined, addUniqueIdentifier?: boolean): string;
    getIdentifier(context: Context | undefined): string;
    getName(): string;
    getStatusMessage(context: Context): string | undefined;
    getExecutionPriority?(context: Context, tree: IExecutionTree): IObjectivePriority;
    getPosition?(): IVector3;
    isDynamic(): boolean;
    addDifficulty(difficulty: number): IObjective;
    getDifficulty(context: Context): number;
    isDifficultyOverridden(): boolean;
    onMove(context: Context): Promise<IObjective | boolean>;
    canIncludeContextHashCode(context: Context): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(context: Context): boolean;
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
export declare type ImpossibleObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.Impossible;
};
export declare type NotPlausibleObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.NotPlausible;
    hashCode: string;
    minimumDifficulty: number;
};
export declare type NotCalculatedYetObjectivePipeline = IBaseObjectivePipeline & {
    status: CalculatedDifficultyStatus.NotCalculatedYet;
    hashCode: string;
    waitingHashCodes: Set<string>;
};
export declare type PossibleObjectivePipeline = Required<IBaseObjectivePipeline> & {
    status: CalculatedDifficultyStatus.Possible;
    depth: number;
    objectives: IObjective[];
    objectiveChain: IObjectiveInfo[];
    difficulty: number;
};
export declare type ObjectivePipeline = ImpossibleObjectivePipeline | NotCalculatedYetObjectivePipeline | PossibleObjectivePipeline | NotPlausibleObjectivePipeline;
export interface IObjectiveInfo {
    depth: number;
    objective: IObjective;
    difficulty: number;
    logs: ILogLine[];
}
export {};
