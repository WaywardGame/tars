import { WeightStatus } from "game/entity/player/IPlayer";

import { log } from "../utilities/Logger";
import type Context from "./context/Context";
import { MovingToNewIslandState, ContextDataType } from "./context/IContext";
import type { IObjective } from "./objective/IObjective";

import type { IPlan } from "./planning/IPlan";
import { ExecuteResultType } from "./planning/IPlan";
import planner from "./planning/Planner";

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
class Executor {

	private interrupted: boolean;
	private weightChanged: boolean;
	private lastPlan: IPlan | undefined;

	constructor() {
		this.reset();
	}

	public getPlan(): IPlan | undefined {
		return this.lastPlan;
	}

	public reset() {
		this.interrupted = false;
		this.weightChanged = false;
		this.lastPlan = undefined;

		planner.reset();
	}

	public interrupt() {
		this.interrupted = true;
	}

	public tryClearInterrupt() {
		if (this.interrupted) {
			this.interrupted = false;
			return true;
		}

		return false;
	}

	public markWeightChanged() {
		this.weightChanged = true;
	}

	public isReady(context: Context, checkForInterrupts: boolean) {
		return !context.player.isResting()
			&& !context.player.isMovingClientside
			&& !context.player.hasDelay()
			&& !context.player.isGhost()
			&& !game.isPaused
			&& (!checkForInterrupts || !this.interrupted);
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

				log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`, MovingToNewIslandState[moveToNewIslandState]);
			}

			let objectiveChain: IObjective[];
			if (Array.isArray(objective)) {
				objectiveChain = objective;
			} else {
				objectiveChain = [objective];
			}

			planner.reset();

			const result = await this.executeObjectiveChain(context, objectiveChain, checkForInterrupts);

			if (result.type === ExecuteObjectivesResultType.Restart) {
				return result;

			} else if (result.type !== ExecuteObjectivesResultType.Completed) {
				return {
					type: ExecuteObjectivesResultType.Pending,
					objectives: result.objectives.concat(objectives.slice(i + 1)),
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
			const plan = this.lastPlan = await planner.createPlan(context, objective);
			if (!plan) {
				if (!objective.ignoreInvalidPlans) {
					log.info(`No valid plan for ${objective.getHashCode()}`);
				}

				break;
			}

			const result = await plan.execute(
				() => {
					this.weightChanged = false;
					return undefined;
				},
				(getObjectiveResults: () => IObjective[]) => {
					if (this.weightChanged && context.player.getWeightStatus() !== WeightStatus.None) {
						log.info("Weight changed. Stopping execution");
						return {
							type: ExecuteResultType.Restart,
						};
					}

					if (!this.isReady(context, checkForInterrupts)) {
						return {
							type: ExecuteResultType.ContinuingNextTick,
							objectives: getObjectiveResults(),
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
				return {
					type: ExecuteObjectivesResultType.ContinuingNextTick,
					objectives: result.objectives.concat(objectives.slice(i + 1)),
				};
			}

			// the plan finished
			this.lastPlan = undefined;
		}

		return {
			type: ExecuteObjectivesResultType.Completed,
		};
	}

}

const executor = new Executor();

export default executor;
