import type { ILogLine } from "utilities/Log";
import type { IObjective, IObjectiveInfo } from "../objective/IObjective";
export interface IPlan {
    readonly tree: IExecutionTree;
    readonly objectives: IObjectiveInfo[];
    getTreeString(root?: IExecutionTree): string;
    execute(preExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined, postExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined): Promise<ExecuteResult>;
}
export interface IExecutionTree<T extends IObjective = IObjective> {
    id: number;
    depth: number;
    objective: T;
    hashCode: string;
    difficulty: number;
    logs: ILogLine[];
    children: IExecutionTree[];
    parent?: IExecutionTree;
    groupedAway?: boolean;
}
export declare enum ExecuteResultType {
    Completed = 0,
    Pending = 1,
    Restart = 2,
    Ignored = 3,
    ContinuingNextTick = 4
}
export declare type ExecuteResult = IExecuteCompleted | IExecutePending | IExecuteWaitingForNextTick | IExecuteRestart | IExecuteIgnored;
export interface IExecuteCompleted {
    type: ExecuteResultType.Completed;
}
export interface IExecutePending {
    type: ExecuteResultType.Pending;
    objectives: Array<IObjective | IObjective[]>;
}
export interface IExecuteWaitingForNextTick {
    type: ExecuteResultType.ContinuingNextTick;
    objectives: Array<IObjective | IObjective[]>;
}
export interface IExecuteRestart {
    type: ExecuteResultType.Restart;
}
export interface IExecuteIgnored {
    type: ExecuteResultType.Ignored;
}
