import { ILogLine } from "utilities/Log";

import { IObjective } from "../IObjective";

export interface IPlan {
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
	logs: ILogLine[];
	children: IExecutionTree[];
	parent?: IExecutionTree;
}

export enum ExecuteResultType {
	Completed,
	Pending,
	Restart,
	ContinuingNextTick,
}

export type ExecuteResult = IExecuteCompleted | IExecutePending | IExecuteWaitingForNextTick | IExecuteRestart;

export interface IExecuteCompleted {
	type: ExecuteResultType.Completed;
}

export interface IExecutePending {
	type: ExecuteResultType.Pending;
	objectives: IObjective[];
}

export interface IExecuteWaitingForNextTick {
	type: ExecuteResultType.ContinuingNextTick;
	objectives: IObjective[];
}

export interface IExecuteRestart {
	type: ExecuteResultType.Restart;
}
