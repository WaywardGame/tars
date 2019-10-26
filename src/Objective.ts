import Creature from "entity/creature/Creature";
import { ILog, nullLog } from "utilities/Log";

import Context from "./Context";
import Planner from "./Core/Planner";
import { IObjective, ObjectiveExecutionResult } from "./IObjective";
import { createLog } from "./Utilities/Logger";

export default abstract class Objective implements IObjective {

	private static uuid = 0;

	private _log: ILog | undefined;

	private _uniqueIdentifier: number | undefined;

	private _additionalDifficulty: number | undefined;

	public abstract getIdentifier(context?: Context): string;

	public abstract execute(context: Context): Promise<ObjectiveExecutionResult>;

	public get log(): ILog {
		if (!Planner.isCreatingPlan) {
			if (this._log === undefined) {
				this._log = createLog(this.getName());
			}

			return this._log;
		}

		return this._log || nullLog;
	}

	public setLogger(log: ILog | undefined): void {
		this._log = log;
	}

	public getHashCode(context?: Context): string {
		let hashCode = this.getIdentifier(context);

		if (this.isDynamic()) {
			if (this._uniqueIdentifier === undefined) {
				this._uniqueIdentifier = Objective.uuid++;
				if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
					Objective.uuid = 0;
				}
			}

			hashCode += `:${this._uniqueIdentifier}`;
		}

		if (this._additionalDifficulty !== undefined) {
			hashCode += `:${this._additionalDifficulty}`;
		}

		return hashCode;
	}

	public toString(): string {
		return this.getHashCode();
	}

	public getName(): string {
		return this.constructor.name;
	}

	/**
	 * Shoud child objectives be able to be saved
	 */
	public canSaveChildObjectives(): boolean {
		return true;
	}

	/**
	 * Can the objective be grouped with other objectives with the same identifier?
	 * It could cause the objective execution order to be re-ordered on the fly to make them execute one after another
	 */
	public canGroupTogether(): boolean {
		return false;
	}

	/**
	 * Checks if the objective changes between the planning and the actual execution
	 */
	public isDynamic(): boolean {
		return false;
	}

	/**
	 * Checks if the context could effect the execution of the objective
	 * @param context The context
	 */
	public canIncludeContextHashCode(context: Context): boolean {
		return false;
	}

	/**
	 * Checks if the context could effect the execution of the objective
	 * Return true if the objective checks the context for items
	 * @param context The context
	 */
	public shouldIncludeContextHashCode(context: Context): boolean {
		return false;
	}

	public addDifficulty(difficulty: number) {
		this._additionalDifficulty = (this._additionalDifficulty || 0) + difficulty;
		return this;
	}

	public getDifficulty(context: Context) {
		let difficulty = this.getBaseDifficulty(context);

		if (this._additionalDifficulty !== undefined) {
			difficulty += this._additionalDifficulty;
		}

		return difficulty;
	}

	public async onMove(context: Context, ignoreCreature?: Creature): Promise<IObjective | boolean> {
		const walkPath = context.player.walkPath;
		if (walkPath) {
			// interrupt if a creature moved along our walk path
			for (const point of walkPath) {
				const tile = game.getTile(point.x, point.y, context.player.z);
				if (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature) {
					this.log.info("Creature moved along walk path, recalculating");
					return true;
				}
			}
		}

		return false;
	}

	protected getBaseDifficulty(_context: Context): number {
		return 0;
	}

}
