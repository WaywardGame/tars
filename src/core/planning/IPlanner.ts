/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Context from "../context/Context";
import type { IObjective, ObjectivePipeline } from "../objective/IObjective";

import type { IPlan } from "./IPlan";

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
