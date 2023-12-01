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
import type { ILogLine } from "@wayward/utilities/Log";
import type { IObjective, IObjectiveInfo, IObjectivePriority } from "../objective/IObjective";
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
    priority?: IObjectivePriority;
    logs: ILogLine[];
    children: IExecutionTree[];
    parent?: IExecutionTree;
    groupParent?: boolean;
    groupedAway?: IExecutionTree;
}
export declare enum ExecuteResultType {
    Completed = 0,
    Pending = 1,
    Restart = 2,
    Ignored = 3,
    ContinuingNextTick = 4
}
export type ExecuteResult = IExecuteCompleted | IExecutePending | IExecuteWaitingForNextTick | IExecuteRestart | IExecuteIgnored;
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
