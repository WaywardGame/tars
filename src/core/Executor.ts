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

import { MovingState } from "@wayward/game/game/entity/IHuman";
import { WeightStatus } from "@wayward/game/game/entity/player/IPlayer";

import type Context from "./context/Context";
import { MovingToNewIslandState, ContextDataType } from "./context/IContext";
import type { IObjective } from "./objective/IObjective";
import Objective from "./objective/Objective";

import type { IPlan } from "./planning/IPlan";
import { ExecuteResultType } from "./planning/IPlan";
import { IPlanner } from "./planning/IPlanner";

export enum ExecuteObjectivesResultType {
	Completed,
	Pending,
	ContinuingNextTick,
	Restart,
}

export type ExecuteObjectivesResult = IExecuteObjectivesCompleted | IExecuteObjectivesInProgress | IExecuteObjectivesContinuingNextTick | IExecuteObjectivesRestart;

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

/**
 * Execute objectives
 */
export class Executor {

	private interrupted: boolean;
	private weightChanged: boolean;
	private latestExecutingPlan: IPlan | undefined;

	constructor(private readonly planner: IPlanner) {
		this.reset();
	}

	public getPlan(): IPlan | undefined {
		return this.latestExecutingPlan;
	}

	public reset(): void {
		this.interrupted = false;
		this.weightChanged = false;
		this.latestExecutingPlan = undefined;

		this.planner.reset();
	}

	public interrupt(): void {
		this.interrupted = true;
	}

	public tryClearInterrupt(): boolean {
		if (this.interrupted) {
			this.interrupted = false;
			return true;
		}

		return false;
	}

	public markWeightChanged(): void {
		this.weightChanged = true;
	}

	public isReady(context: Context, checkForInterrupts: boolean): boolean {
		return !context.human.isResting &&
			context.human.movingData.state !== MovingState.Moving &&
			!context.human.hasDelay() &&
			!context.human.isGhost &&
			!game.isPaused &&
			(!checkForInterrupts || !this.interrupted);
	}

	/**
	 * Execute objectives
	 * @param context Context object
	 * @param objectives Array of objectives
	 * @param resetContextState True to reset the context before running each objective
	 * @param checkForInterrupts True to interrupt objective execution when an interrupt occurs
	 */
	public async executeObjectives(
		context: Context,
		objectives: Array<IObjective | IObjective[]>,
		resetContextState: boolean,
		checkForInterrupts: boolean = false): Promise<ExecuteObjectivesResult> {
		const length = objectives.length;
		for (let i = 0; i < length; i++) {
			const objective = objectives[i];

			if (!this.isReady(context, checkForInterrupts)) {
				return {
					type: ExecuteObjectivesResultType.Restart,
				};
			}

			if (resetContextState) {
				// reset before running objectives
				context.reset();

				const moveToNewIslandState = context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

				context.log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`, MovingToNewIslandState[moveToNewIslandState]);
			}

			Objective.reset();
			this.planner.reset();

			const objectiveChain = Array.isArray(objective) ? objective : [objective];

			const result = await this.executeObjectiveChain(context, objectiveChain, checkForInterrupts);

			if (result.type === ExecuteObjectivesResultType.Restart) {
				return result;

			} else if (result.type !== ExecuteObjectivesResultType.Completed) {
				const remainingObjectives = objectives.slice(i + 1);

				// log.debug(`Non-completed objective result: ${ExecuteObjectivesResultType[result.type]}`);
				// log.debug(`Result objectives: ${Plan.getPipelineString(context, result.objectives)}`);
				// log.debug(`Remaining objectives: ${Plan.getPipelineString(context, remainingObjectives)}`);

				return {
					type: ExecuteObjectivesResultType.Pending,
					objectives: result.objectives.concat(remainingObjectives),
				};
			}
		}

		return {
			type: ExecuteObjectivesResultType.Completed,
		};
	}

	/**
	 * Execute an objective chain
	 * @param context Context object
	 * @param objectives Array of objectives
	 * @param checkForInterrupts True to interrupt objective execution when an interrupt occurs
	 */
	private async executeObjectiveChain(context: Context, objectives: IObjective[], checkForInterrupts: boolean): Promise<ExecuteObjectivesResult> {
		for (let i = 0; i < objectives.length; i++) {
			const objective = objectives[i];
			const plan = await this.planner.createPlan(context, objective);
			if (!plan) {
				if (!objective.ignoreInvalidPlans) {
					this.latestExecutingPlan = plan;

					context.log.info(`No valid plan for ${objective.getHashCode(context)}`);
				}

				break;
			}

			if (plan.objectives.length > 1) {
				// the plan has things to excecute
				this.latestExecutingPlan = plan;
			}

			const result = await plan.execute(
				() => {
					this.weightChanged = false;
					return undefined;
				},
				(getObjectiveResults: () => IObjective[]) => {
					if (this.weightChanged && context.human.getWeightStatus() !== WeightStatus.None) {
						context.log.info("Weight changed. Stopping execution");
						return {
							type: ExecuteResultType.Restart,
						};
					}

					const remainingObjectives = getObjectiveResults();
					if (remainingObjectives.length > 0 && !this.isReady(context, checkForInterrupts)) {
						return {
							type: ExecuteResultType.ContinuingNextTick,
							objectives: remainingObjectives,
						};
					}

					return undefined;
				});

			if (result.type === ExecuteResultType.Restart) {
				return {
					type: ExecuteObjectivesResultType.Restart,
				};

			} else if (result.type === ExecuteResultType.Ignored) {
				// stop running this chain and bail out if we're ignoring one of the objectives
				return {
					type: ExecuteObjectivesResultType.Completed,
				};

			} else if (result.type !== ExecuteResultType.Completed) {
				const remainingObjectives = objectives.slice(i + 1);

				// log.debug(`ContinuingNextTick objectives: ${Plan.getPipelineString(context, result.objectives)}`);
				// log.debug(`Remaining objectives: ${Plan.getPipelineString(context, remainingObjectives)}`);

				return {
					type: ExecuteObjectivesResultType.ContinuingNextTick,
					objectives: result.objectives.concat(remainingObjectives),
				};
			}

			// the plan finished
			this.latestExecutingPlan = undefined;
		}

		return {
			type: ExecuteObjectivesResultType.Completed,
		};
	}

}
