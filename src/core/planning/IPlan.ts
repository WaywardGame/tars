import type { ILogLine } from "utilities/Log";

import type { IObjective, IObjectiveInfo, IObjectivePriority } from "../objective/IObjective";

export interface IPlan {

	/**
	 * Full execution tree
	 */
	readonly tree: IExecutionTree;

	/**
	 * Flattened list of objectives to execute
	 */
	readonly objectives: IObjectiveInfo[];

	/**
	 * Print the excution tree as a string
	 */
	getTreeString(root?: IExecutionTree): string;

	/**
	 * Executes the plan. It will continue executing objectives until it's done or isReady returns false
	 * @param preExecuteObjective Called before executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 * @param postExecuteObjective Called after executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 */
	execute(
		preExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined,
		postExecuteObjective: (getObjectiveResults: () => IObjective[]) => ExecuteResult | undefined): Promise<ExecuteResult>;
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

export enum ExecuteResultType {
	Completed,
	Pending,
	Restart,
	Ignored,
	ContinuingNextTick,
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