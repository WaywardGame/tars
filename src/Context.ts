import Player from "entity/player/Player";
import { ItemType } from "item/IItem";
import Item from "item/Item";
import { IVector3 } from "utilities/math/IVector";

import { IBase, IInventoryItems } from "./ITars";

export enum ContextDataType {
	Position = "Position",
	LastAcquiredItem = "LastAcquiredItem",
	LastBuiltDoodad = "LastBuiltDoodad",
	Item1 = "Item1",

	/**
	 * Allow the OrganizeInventory objective to move reserved items into the intermediate chest
	 */
	AllowOrganizingReservedItemsIntoIntermediateChest = "AllowOrganizingReservedItemsIntoIntermediateChest",

	/**
	 * The next recipe/dismantle in the execution tree allows the use of the intermediate chest
	 */
	NextActionAllowsIntermediateChest = "NextActionAllowsIntermediateChest",

	/**
	 * The next recipe can be crafted from the intermediate chest
	 */
	CanCraftFromIntermediateChest = "CanCraftFromIntermediateChest",

	/**
	 * Prioritize using items from base chest for the objective over gather out in the field
	 */
	PrioritizeBaseChests = "PrioritizeBaseChests",

	/**
	 * Set when TARS is moving to a new island
	 */
	MovingToNewIsland = "MovingToNewIsland",
}

export class ContextState {

	constructor(
		public depth: number = 0,
		public includeHashCode: boolean = false,
		public minimumAcceptedDifficulty?: number | undefined,
		public readonly reservedItems: Set<number> = new Set(),
		public readonly reservedItemTypes: Set<number> = new Set(),

		/**
		 * Dynamic data available during objective execution
		 */
		public data?: Map<string, any> | undefined) {
	}

	public get shouldIncludeHashCode(): boolean {
		return this.includeHashCode || this.reservedItems.size > 0 || this.reservedItemTypes.size > 0;
	}

	public merge(state: ContextState): void {
		if (state.includeHashCode) {
			this.includeHashCode = true;
		}

		for (const item of state.reservedItems) {
			this.reservedItems.add(item);
		}

		for (const itemType of state.reservedItemTypes) {
			this.reservedItemTypes.add(itemType);
		}

		if (state.data) {
			if (!this.data) {
				this.data = new Map();
			}

			for (const [type, value] of state.data) {
				this.data.set(type, value);
			}
		}
	}

	public reset() {
		this.depth = 0;
		this.includeHashCode = false;
		this.minimumAcceptedDifficulty = undefined;
		this.reservedItems.clear();
		this.reservedItemTypes.clear();
		this.data = undefined;
	}

	public get<T = any>(type: string): T | undefined {
		return this.data ? this.data.get(type) : undefined;
	}

	public set<T = any>(type: string, value: T | undefined) {
		if (!this.data) {
			this.data = new Map();
		}

		this.data.set(type, value);
	}

	public clone(increaseDepth: boolean): ContextState {
		return new ContextState(
			increaseDepth ? this.depth + 1 : this.depth,
			this.includeHashCode,
			this.minimumAcceptedDifficulty,
			new Set(this.reservedItems),
			new Set(this.reservedItemTypes),
			this.data ? new Map(this.data) : undefined);
	}

	public getHashCode(): string {
		return `${this.reservedItems.size > 0 ? `Reserved: ${Array.from(this.reservedItems.values()).map(id => id).join(",")}` : ""}`;
	}
}

export default class Context {

	private changes: ContextState | undefined;

	constructor(
		public readonly player: Player /*| NPC*/,
		public readonly base: IBase,
		public readonly inventory: IInventoryItems,
		public state = new ContextState(),
		public readonly calculatingDifficulty: boolean = false,
		private initialState?: ContextState) {
	}

	public toString() {
		return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined})`;
	}

	public clone(calculatingDifficulty: boolean = false, increaseDepth: boolean = false): Context {
		return new Context(this.player, this.base, this.inventory, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState ? this.initialState.clone(increaseDepth) : undefined);
	}

	public merge(state: ContextState): void {
		this.state.merge(state);

		if (this.changes) {
			this.changes.merge(state);
		}
	}

	public watchForChanges(): ContextState {
		if (this.changes) {
			throw new Error("Already watching for changes");
		}

		this.changes = new ContextState(this.state.depth);

		return this.changes;
	}

	public unwatch() {
		this.changes = undefined;
	}

	/**
	 * Checks if the item is reserved by another objective
	 */
	public isReservedItem(item: Item) {
		if (this.state.reservedItems.has(item.id)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if an item with the given item type is reserved by another objective
	 */
	public isReservedItemType(itemType: ItemType) {
		return this.state.reservedItemTypes.has(itemType);
	}

	public getData<T = any>(type: string): T | undefined {
		return this.state.get(type);
	}

	public setData<T = any>(type: string, value: T | undefined) {
		this.state.set(type, value);

		if (this.changes) {
			this.changes.set(type, value);
		}
	}

	public addReservedItems(...items: Item[]) {
		for (const item of items) {
			this.state.reservedItems.add(item.id);
			this.state.reservedItemTypes.add(item.type);

			if (this.changes) {
				this.changes.reservedItems.add(item.id);
				this.changes.reservedItemTypes.add(item.type);
			}
		}
	}

	public setInitialState(state: ContextState = this.state.clone(false)) {
		this.initialState = state;
	}

	public reset() {
		this.changes = undefined;

		if (this.initialState) {
			this.state = this.initialState.clone(false);

		} else {
			this.state.reset();
		}

		this.setData(ContextDataType.Position, this.player.getPoint());
	}

	public getHashCode(): string {
		return this.state.getHashCode();
	}

	/**
	 * Mark that we should include the hash code when caching this objective and it's parents
	 * This is called when we try to use a reserved items
	 */
	public markShouldIncludeHashCode() {
		this.state.includeHashCode = true;

		if (this.changes) {
			this.changes.includeHashCode = true;
		}
	}

	/**
	 * Check if the given difficulty is plausible
	 * @returns True if the easiest objective in the parents list is not easier than this one
	 */
	public isPlausible(difficulty: number, requireMinimumAcceptedDifficulty: boolean = false) {
		if (requireMinimumAcceptedDifficulty && this.state.minimumAcceptedDifficulty === undefined) {
			return true;
		}

		return this.state.minimumAcceptedDifficulty === undefined || this.state.minimumAcceptedDifficulty >= difficulty;
	}

	public getPosition(): IVector3 {
		const position = this.getData(ContextDataType.Position);
		if (position && (position.x === undefined || position.y === undefined || position.z === undefined)) {
			// tslint:disable-next-line: no-console
			console.error("invalid value", position);
			// tslint:disable-next-line: no-console
			console.trace("lastKnownPosition get");
		}

		return position || this.player.getPoint();
	}
}
