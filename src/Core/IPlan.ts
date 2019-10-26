import { ILogLine } from "utilities/Log";

import { IObjective, ObjectiveResult } from "../IObjective";

/**
 * Represents a chain of objectives that can be executed in order to complete the plan.
 */
export interface IPlan {
	/**
	 * Executes the plan. It will continue executing objectives until it's done or isReady returns false
	 * @param preExecuteObjective Called before executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 * @param postExecuteObjective Called after executing each objective. Return false if the player is busy or if an interrupt is interrupting
	 */
	execute(preExecuteObjective: () => boolean, postExecuteObjective: () => boolean): Promise<IObjective[] | ObjectiveResult.Restart | boolean>;
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
