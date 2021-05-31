import { WeightStatus } from "game/entity/player/IPlayer";

import Context from "../Context";
import { MovingToNewIslandState, ContextDataType } from "../IContext";
import { IObjective } from "../IObjective";
import { log } from "../utilities/Logger";

import { ExecuteResultType, IPlan } from "./IPlan";
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

				const moveToNewIslandState = context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

				log.debug(`Reset context state. Context hash code: ${context.getHashCode()}.`, MovingToNewIslandState[moveToNewIslandState]);
			}

			let objs: IObjective[];
			if (Array.isArray(objective)) {
				objs = objective;
			} else {
				objs = [objective];
			}

			planner.reset();

			for (const o of objs) {
				const plan = this.lastPlan = await planner.createPlan(context, o);
				if (!plan) {
					log.info(`No valid plan for ${o.getHashCode()}`);
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

				// the plan finished
				this.lastPlan = undefined;
			}
		}

		return {
			type: ExecuteObjectivesResultType.Completed,
		};
	}

}

const executor = new Executor();

export default executor;
