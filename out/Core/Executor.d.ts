import Context from "./context/Context";
import { IObjective } from "./objective/IObjective";
import { IPlan } from "./planning/IPlan";
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
declare class Executor {
    private interrupted;
    private weightChanged;
    private lastPlan;
    constructor();
    getPlan(): IPlan | undefined;
    reset(): void;
    interrupt(): void;
    tryClearInterrupt(): boolean;
    markWeightChanged(): void;
    isReady(context: Context, checkForInterrupts: boolean): boolean;
    executeObjectives(context: Context, objectives: Array<IObjective | IObjective[]>, resetContextState: boolean, checkForInterrupts?: boolean): Promise<ExecuteObjectivesResult>;
    private executeObjectiveChain;
}
declare const executor: Executor;
export default executor;
