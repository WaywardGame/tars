import Context from "../context/Context";
import { IObjective, ObjectivePipeline } from "../objective/IObjective";

import { IPlan } from "./IPlan";

/**
 * Creates plans for executing objectives
 * 
 * The plan will contain the optimal tree for completing the objective
 * 
 * Related reading:
 *
 * https://en.wikipedia.org/wiki/Automated_planning_and_scheduling
 * https://en.wikipedia.org/wiki/Backward_chaining
 * https://en.wikipedia.org/wiki/Game_tree
 *
 * Or ask Spacetech about it
 */
export interface IPlanner {
	/**
	 * Returns true if a plan is currently being created
	 */
	readonly isCreatingPlan: boolean;

	/**
	 * Enables debug mode, which emits additional logs to the console
	 */
	debug: boolean;

	/**
	 * Reset the cached difficulties for objectives
	 */
	reset(): void;

	/**
	 * Creates a plan that completes the given objective
	 * @param context The context
	 * @param objective The objective for the Plan
	 * @returns The plan or undefined if no plan can be found
	 */
	createPlan(context: Context, objective: IObjective): Promise<IPlan | undefined>;

	/**
	 * Determines the easiest objective pipeline to execute
	 * @param context The context
	 * @param objectives List of objective pipelines
	 * @returns The objective pipeline to execute
	 */
	pickEasiestObjectivePipeline(context: Context, objectives: IObjective[][]): Promise<ObjectivePipeline>;
}
