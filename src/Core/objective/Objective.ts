import type Creature from "game/entity/creature/Creature";
import type { ILog } from "utilities/Log";
import { nullLog } from "utilities/Log";

import type Context from "../context/Context";
import { ContextDataType } from "../context/IContext";
import { loggerUtilities } from "../../utilities/Logger";
import { ReserveType } from "../ITars";
import type { IObjective, ObjectiveExecutionResult } from "./IObjective";

export default abstract class Objective implements IObjective {

	private static uuid = 0;

	public static enableLogging = true;

	protected contextDataKey: string = ContextDataType.LastAcquiredItem;
	protected reserveType: ReserveType | undefined; // defaults to Hard

	private _log: ILog | undefined;

	private _uniqueIdentifier: number | undefined;

	private _additionalDifficulty: number | undefined;
	private _overrideDifficulty: number | undefined;

	private _status: IObjective | (() => string) | string | undefined;

	public abstract getIdentifier(): string;

	/**
	 * Human readable status for what the objective is doing
	 */
	public abstract getStatus(context: Context): string | undefined;

	public abstract execute(context: Context): Promise<ObjectiveExecutionResult>;

	public get log(): ILog {
		if (Objective.enableLogging) {
			return this._log ??= loggerUtilities.createLog(this.getName());
		}

		return this._log ?? nullLog;
	}

	public setLogger(log: ILog | undefined): void {
		this._log = log;
	}

	public getHashCode(addUniqueIdentifier?: boolean): string {
		let hashCode = this.getIdentifier();

		if (hashCode.includes("[object")) {
			console.warn("Invalid objective identifier", hashCode);
		}

		if (this.isDynamic() || addUniqueIdentifier || this._uniqueIdentifier !== undefined) {
			this.addUniqueIdentifier();

			hashCode += `:${this._uniqueIdentifier}`;
		}

		if (this._additionalDifficulty !== undefined) {
			hashCode += `:${this._additionalDifficulty}`;
		}

		if (this._overrideDifficulty !== undefined) {
			hashCode += `:${this._overrideDifficulty}`;
		}

		// the context data key check prevents an infinite loop
		// AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll
		// -> AcquireItemFromDismantle:Twigs:Branch,SaguaroCactusRibs,Winterberries:156707:[AcquireItemFromDismantle:WoodenShavings:WoodenDowels,Twigs:155925:[AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll:155553:[AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll:154175:
		if (this.contextDataKey !== ContextDataType.LastAcquiredItem && this.contextDataKey.startsWith(this.getIdentifier())) {
			hashCode += `:[${this.contextDataKey}]`;
		}

		if (this.reserveType !== undefined) {
			hashCode += `:${ReserveType[this.reserveType]}`;
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
	 * Human readable status for what the objective is doing
	 */
	public getStatusMessage(context: Context): string | undefined {
		switch (typeof (this._status)) {
			case "string":
				return this._status;

			case "function":
				return this._status();

			case "object":
				return this._status.getStatusMessage(context);

			default:
				return this.getStatus(context);
		}
	}

	public setStatus(status: IObjective | (() => string) | string) {
		this._status = status;
		return this;
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

	public overrideDifficulty(difficulty: number | undefined) {
		this._overrideDifficulty = difficulty;
		return this;
	}

	public isDifficultyOverridden(): boolean {
		return this._overrideDifficulty !== undefined;
	}

	public getDifficulty(context: Context) {
		if (this._overrideDifficulty !== undefined) {
			return this._overrideDifficulty;
		}

		let difficulty = this.getBaseDifficulty(context);

		if (this._additionalDifficulty !== undefined) {
			difficulty += this._additionalDifficulty;
		}

		return difficulty;
	}

	/**
	 * Called when the player moves while this objective is running
	 */
	public async onMove(context: Context, ignoreCreature?: Creature): Promise<IObjective | boolean> {
		const walkPath = context.player.walkPath;
		if (walkPath) {
			// interrupt if an npc or creature moved along our walk path (only close point)
			for (let i = 0; i < Math.min(20, walkPath.path.length); i++) {
				const point = walkPath.path[i];
				const tile = context.island.getTile(point.x, point.y, context.player.z);
				if (tile.npc !== undefined || (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature)) {
					this.log.info("NPC or creature moved along walk path, recalculating");
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * For AcquireItem objectives, the key will be set to the item once it's acquired
	 */
	public setContextDataKey(contextDataKey: string) {
		this.contextDataKey = contextDataKey;
		return this;
	}

	/**
	 * Set the reserve type for the acquired item
	 */
	public setReserveType(reserveType: ReserveType | undefined) {
		this.reserveType = reserveType;
		return this;
	}

	public passAcquireData(objective: Objective, reserveType?: ReserveType) {
		this.contextDataKey = objective.contextDataKey;
		this.reserveType = reserveType ?? objective.reserveType;
		return this;
	}

	protected getBaseDifficulty(_context: Context): number {
		return 0;
	}

	/**
	 * Adds a unique identifier to this objective
	 * Prevents some caching logic related to hash codes
	 */
	protected addUniqueIdentifier() {
		if (this._uniqueIdentifier === undefined) {
			this._uniqueIdentifier = Objective.uuid++;
			if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
				Objective.uuid = 0;
			}
		}
	}
}
