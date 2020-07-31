import Doodad from "doodad/Doodad";
import Player from "entity/player/Player";
import { ItemType } from "item/IItem";
import Item from "item/Item";

import { IBase, IInventoryItems } from "./ITars";

export enum ContextDataType {
	LastKnownPosition,
	LastAcquiredItem,
	LastBuiltDoodad,
	Item1,
	Item2,

	/**
	 * Allow the OrganizeInventory objective to move reserved items into the intermediate chest
	 */
	AllowOrganizingReservedItemsIntoIntermediateChest,

	/**
	 * The next recipe/dismantle in the execution tree allows the use of the intermediate chest
	 */
	NextActionAllowsIntermediateChest,

	/**
	 * The next recipe can be crafted from the intermediate chest
	 */
	CanCraftFromIntermediateChest,

	/**
	 * Indicates we're waiting for a water still
	 */
	WaitingForWaterStill,
}

export interface IContextData {
	[ContextDataType.LastKnownPosition]: IVector3;
	[ContextDataType.LastAcquiredItem]: Item;
	[ContextDataType.LastBuiltDoodad]: Doodad;
	[ContextDataType.Item1]: Item;
	[ContextDataType.Item2]: Item;
	[ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest]: boolean;
	[ContextDataType.NextActionAllowsIntermediateChest]: boolean;
	[ContextDataType.CanCraftFromIntermediateChest]: boolean;
	[ContextDataType.WaitingForWaterStill]: boolean;
}

export type ContextDataMap<T extends ContextDataType> = IContextData[T];

export class ContextState {

	constructor(
		public depth: number,
		public includeHashCode: boolean = false,
		public minimumAcceptedDifficulty?: number | undefined,
		public readonly reservedItems: Set<number> = new Set(),
		public readonly reservedItemTypes: Set<number> = new Set(),

		/**
		 * Dynamic data available during objective execution
		 */
		public data?: Map<ContextDataType, any> | undefined) {
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

	public get<T extends ContextDataType>(type: T): ContextDataMap<T> | undefined {
		return this.data ? this.data.get(type) : undefined;
	}

	public set<T extends ContextDataType>(type: T, value: ContextDataMap<T> | undefined) {
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
		public state = new ContextState(0),
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

	public getData<T extends ContextDataType>(type: T): ContextDataMap<T> | undefined {
		return this.state.get(type);
	}

	public setData<T extends ContextDataType>(type: T, value: ContextDataMap<T> | undefined) {
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

	public setInitialState() {
		this.initialState = this.state.clone(false);
	}

	public reset() {
		this.changes = undefined;

		if (this.initialState) {
			this.state = this.initialState.clone(false);

		} else {
			this.state.reset();
		}

		this.setData(ContextDataType.LastKnownPosition, this.player.getPoint());
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
		const lastKnownPosition = this.getData(ContextDataType.LastKnownPosition);
		if (lastKnownPosition && (lastKnownPosition.x === undefined || lastKnownPosition.y === undefined || lastKnownPosition.z === undefined)) {
			// tslint:disable-next-line: no-console
			console.error("invalid value", lastKnownPosition);
			// tslint:disable-next-line: no-console
			console.trace("lastKnownPosition get");
		}

		return lastKnownPosition || this.player;
	}
}
