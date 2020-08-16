import { WeightStatus } from "entity/player/IPlayer";

import Context from "../Context";
import { IObjective } from "../IObjective";
import { log } from "../Utilities/Logger";

import { ExecuteResultType } from "./IPlan";
import planner from "./Planner";

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

// * @returns An objective (if it's still being worked on), True if all the objectives are completed
// * False if objectives are waiting for the next tick to continue running

class Executor {

	private interrupted: boolean;
	private weightChanged: boolean;

	constructor() {
		this.reset();
	}

	public reset() {
		this.interrupted = false;
		this.weightChanged = false;
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
			&& !game.paused
			&& (!checkForInterrupts || !this.interrupted);
	}

	/**
	 * Execute objectives
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
				log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`);
			}

			let objs: IObjective[];
			if (Array.isArray(objective)) {
				objs = objective;
			} else {
				objs = [objective];
			}

			planner.reset();

			for (const o of objs) {
				const plan = await planner.createPlan(context, o);
				if (!plan) {
					log.warn(`No valid plan for ${o.getHashCode()}`);
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

				switch (result.type) {
					case ExecuteResultType.Completed:
						// continue and run the next objective
						break;

					case ExecuteResultType.Pending:
						return {
							type: ExecuteObjectivesResultType.Pending,
							objectives: result.objectives.concat(objectives.slice(i + 1)),
						};

					case ExecuteResultType.ContinuingNextTick:
						return {
							type: ExecuteObjectivesResultType.ContinuingNextTick,
							objectives: result.objectives.concat(objectives.slice(i + 1)),
						};

					case ExecuteResultType.Restart:
						return {
							type: ExecuteObjectivesResultType.Restart,
						};
				}
			}
		}

		return {
			type: ExecuteObjectivesResultType.Completed,
		};
	}

}

const executor = new Executor();

export default executor;
