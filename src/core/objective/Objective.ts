/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Creature from "game/entity/creature/Creature";
import type { ILog } from "utilities/Log";
import { nullLog } from "utilities/Log";

import type Context from "../context/Context";
import { ContextDataType } from "../context/IContext";
import { ReserveType } from "../ITars";
import type { HashCodeFiltering, IObjective, ObjectiveExecutionResult } from "./IObjective";
import type Item from "game/item/Item";
import { LoggerUtilities } from "../../utilities/Logger";
import { PlanningAccuracy } from "../ITarsOptions";

export default abstract class Objective implements IObjective {

	private static uuid = 0;

	public static reset() {
		this.uuid = 0;
	}

	public enableLogging = true;

	protected includeUniqueIdentifierInHashCode?: boolean;

	/**
	 * Set to true if the position will always matter
	 * Set to false if the position of the player does not matter
	 */
	public includePositionInHashCode?: boolean;

	protected contextDataKey: string = ContextDataType.LastAcquiredItem;
	protected _shouldKeepInInventory: boolean | undefined; // defaults to false
	protected reserveType: ReserveType | undefined; // defaults to Hard

	private _log: ILog | undefined;

	private _uniqueIdentifier: number | undefined;

	private _overrideDifficulty: number | undefined;

	private _status: IObjective | (() => string) | string | undefined;

	public abstract getIdentifier(context: Context | undefined): string;

	/**
	 * Human readable status for what the objective is doing
	 */
	public abstract getStatus(context: Context): string | undefined;

	public abstract execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult>;

	public get log(): ILog {
		if (this.enableLogging && !this._log) {
			// throw new Error("Invalid logger");
			this._log = nullLog;
		}

		return this._log ?? nullLog;
	}

	public ensureLogger(loggerUtilities: LoggerUtilities) {
		if (this._log === undefined) {
			this.setLogger(loggerUtilities.createLog(this.getName()));
		}
	}

	public setLogger(log: ILog | undefined): void {
		this._log = log;
	}

	public getHashCode(context: Context | undefined, skipContextDataKey?: boolean): string {
		let hashCode = this.getIdentifier(context);

		if (hashCode.includes("[object")) {
			console.warn("Invalid objective identifier", hashCode);
		}

		// greatly increases accuracy at a cost of performance
		if (context && this.includePositionInHashCode !== false && (this.includePositionInHashCode || context.options.planningAccuracy === PlanningAccuracy.Accurate)) {
			const tile = context.getTile();
			hashCode += `:(${tile.x},${tile.y},${tile.z})`;
		}

		if (this.includeUniqueIdentifierInHashCode) {
			hashCode += `:${this._uniqueIdentifier ??= this.getUniqueIdentifier()}`;
		}

		if (this._overrideDifficulty !== undefined) {
			hashCode += `:${this._overrideDifficulty}`;
		}

		// the context data key check prevents an infinite loop
		// AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll
		// -> AcquireItemFromDismantle:Twigs:Branch,SaguaroCactusRibs,Winterberries:156707:[AcquireItemFromDismantle:WoodenShavings:WoodenDowels,Twigs:155925:[AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll:155553:[AcquireItemFromDismantle:ShreddedPaper:TatteredMap,OldInstructionalScroll,PaperSheet,DrawnMap,OrnateBlueBook,Journal,MossCoveredBook,GildedRedBook,OldEducationalScroll:154175:
		// ! updated comment below !
		// this check used to also be here: && this.contextDataKey.startsWith(this.getIdentifier(context)
		// that fixes the above infinite loop, but another issue remains
		// if there's are 2 AcquireItemFromDismantle calls like AcquireItemFromDismantle:StrippedBark:Branch,TreeBark:2830:Hard and AcquireItemFromDismantle:StrippedBark:Branch,TreeBark:2743:Hard and both those calls end up trying to gather a branch from a doodad, the context is lost when deduping the objectives
		// the special context must be passed along the chain to ensure the individual trees remain unique
		if (!skipContextDataKey && this.contextDataKey !== ContextDataType.LastAcquiredItem) {
			hashCode += `:[${this.contextDataKey}]`;
		}

		if (context && this.reserveType === ReserveType.Soft) {
			hashCode += `:${ReserveType[this.reserveType]}`;
		}

		return hashCode;
	}

	public toString(): string {
		return this.getHashCode(undefined);
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
	 * @param objectiveHashCode The objectives hash code
	 */
	public canIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean | HashCodeFiltering {
		return false;
	}

	/**
	 * Checks if the context could effect the execution of the objective
	 * Return true if the objective checks the context for items
	 * @param context The context
	 * @param objectiveHashCode The objectives hash code
	 */
	public shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean {
		return false;
	}

	public overrideDifficulty(difficulty: number | undefined) {
		this._overrideDifficulty = difficulty;
		return this;
	}

	public passOverriddenDifficulty(objective: Objective) {
		this._overrideDifficulty = objective._overrideDifficulty;
		return this;
	}

	public isDifficultyOverridden(): boolean {
		return this._overrideDifficulty !== undefined;
	}

	public getDifficulty(context: Context) {
		if (this._overrideDifficulty !== undefined) {
			return this._overrideDifficulty;
		}

		return this.getBaseDifficulty(context);
	}

	/**
	 * Called when the player moves while this objective is running
	 */
	public async onMove(context: Context, ignoreCreature?: Creature): Promise<IObjective | boolean> {
		const walkPath = context.human.walkPath;
		if (walkPath) {
			// interrupt if an npc or creature moved along our walk path (only close point)
			for (let i = 0; i < Math.min(10, walkPath.path.length); i++) {
				const point = walkPath.path[i];
				const tile = context.island.getTile(point.x, point.y, context.human.z);
				if ((tile.npc !== undefined && tile.npc !== context.human) || (tile.creature && !tile.creature.isTamed() && tile.creature !== ignoreCreature)) {
					this.log.info("NPC or creature moved along walk path, recalculating");
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * For AcquireItem objectives, the key will be set to the item once it's acquired
	 * For objectives that are going to use an item, this will change how context.getAcquiredItem() works
	 */
	public setContextDataKey(contextDataKey: string) {
		this.contextDataKey = contextDataKey;
		return this;
	}

	public shouldKeepInInventory() {
		return this._shouldKeepInInventory ?? false;
	}

	/**
	 * Marks that the acquired item should be kept in the inventory even when the player is overweight
	 */
	public keepInInventory() {
		this._shouldKeepInInventory = true;
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
		this._shouldKeepInInventory = objective._shouldKeepInInventory;
		this.reserveType = reserveType ?? objective.reserveType;
		return this;
	}

	public passShouldKeepInInventory(objective: Objective) {
		this._shouldKeepInInventory = objective._shouldKeepInInventory;
		return this;
	}

	/**
	 * Returns the last acquired item based on the context data key
	 */
	protected getAcquiredItem(context: Context): Item | undefined {
		return context.getData(this.contextDataKey);
	}

	protected getBaseDifficulty(_context: Context): number {
		return 0;
	}

	/**
	 * Get a unique identifier for a objective
	 */
	protected getUniqueIdentifier(): number {
		const uniqueIdentifier = Objective.uuid++;
		if (Objective.uuid >= Number.MAX_SAFE_INTEGER) {
			Objective.uuid = 0;
		}

		return uniqueIdentifier;
	}

	/**
	 * Gets a unique context data key
	 */
	protected getUniqueContextDataKey(itemIdentifier: string): string {
		// not including the context data key fixes an infinite loop
		// example infinite loop: near infinite AcquireItemFromDismantles
		return `${this.getHashCode(undefined, true)}:${itemIdentifier}`;
	}

}
