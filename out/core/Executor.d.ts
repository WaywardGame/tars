import type Context from "./context/Context";
import type { IObjective } from "./objective/IObjective";
import type { IPlan } from "./planning/IPlan";
import { IPlanner } from "./planning/IPlanner";
export declare enum ExecuteObjectivesResultType {
    Completed = 0,
    Pending = 1,
    ContinuingNextTick = 2,
    Restart = 3
}
export declare type ExecuteObjectivesResult = IExecuteObjectivesCompleted | IExecuteObjectivesInProgress | IExecuteObjectivesContinuingNextTick | IExecuteObjectivesRestart;
export interface IExecuteObjectivesCompleted {
    type: ExecuteObjectivesResultType.Completed;
}
export interface IExecuteObjectivesInProgress {
    type: ExecuteObjectivesResultType.Pending;
    objectives: Array<IObjective | IObjective[]>;
}
export interface IExecuteObjectivesContinuingNextTick {
    type: ExecuteObjectivesResultType.ContinuingNextTick;
    objectives: Array<IObjective | IObjective[]>;
}
export interface IExecuteObjectivesRestart {
    type: ExecuteObjectivesResultType.Restart;
}
export declare class Executor {
    private readonly planner;
    private interrupted;
    private weightChanged;
    private latestExecutingPlan;
    constructor(planner: IPlanner);
    getPlan(): IPlan | undefined;
    reset(): void;
    interrupt(): void;
    tryClearInterrupt(): boolean;
    markWeightChanged(): void;
    isReady(context: Context, checkForInterrupts: boolean): boolean;
    executeObjectives(context: Context, objectives: Array<IObjective | IObjective[]>, resetContextState: boolean, checkForInterrupts?: boolean): Promise<ExecuteObjectivesResult>;
    private executeObjectiveChain;
}
