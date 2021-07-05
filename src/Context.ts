import Player from "game/entity/player/Player";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { IVector3 } from "utilities/math/IVector";

import ContextState from "./ContextState";
import { ContextDataType } from "./IContext";
import { IBase, IContext, IInventoryItems, ITarsOptions } from "./ITars";

export default class Context implements IContext {

	private changes: ContextState | undefined;

	constructor(
		public readonly player: Player /*| NPC*/,
		public readonly base: IBase,
		public readonly inventory: IInventoryItems,
		public readonly options: Readonly<ITarsOptions>,
		public state = new ContextState(),
		public readonly calculatingDifficulty: boolean = false,
		private initialState?: ContextState) {
	}

	public toString() {
		return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined})`;
	}

	public clone(calculatingDifficulty: boolean = false, increaseDepth: boolean = false): Context {
		return new Context(this.player, this.base, this.inventory, this.options, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState ? this.initialState.clone(increaseDepth) : undefined);
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
		if (this.state.softReservedItems.has(item.id) || this.state.hardReservedItems.has(item.id)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is not going to be consumed
	 */
	public isSoftReservedItem(item: Item) {
		if (this.state.softReservedItems.has(item.id)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is going to be consumed
	 */
	public isHardReservedItem(item: Item) {
		if (this.state.hardReservedItems.has(item.id)) {
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

	public getDataOrDefault<T = any>(type: string, defaultValue: T): T {
		return this.getData(type) ?? defaultValue;
	}

	public setData<T = any>(type: string, value: T | undefined) {
		this.state.set(type, value);

		if (this.changes) {
			this.changes.set(type, value);
		}
	}

	public addSoftReservedItems(...items: Item[]) {
		for (const item of items) {
			this.state.softReservedItems.add(item.id);
			this.state.reservedItemTypes.add(item.type);

			if (this.changes) {
				this.changes.softReservedItems.add(item.id);
				this.changes.reservedItemTypes.add(item.type);
			}
		}
	}

	public addHardReservedItems(...items: Item[]) {
		for (const item of items) {
			this.state.hardReservedItems.add(item.id);
			this.state.reservedItemTypes.add(item.type);

			if (this.changes) {
				this.changes.hardReservedItems.add(item.id);
				this.changes.reservedItemTypes.add(item.type);
			}
		}
	}

	public addProvidedItems(itemTypes: ItemType[]) {
		for (const itemType of itemTypes) {
			this.state.providedItems.set(itemType, (this.state.providedItems.get(itemType) ?? 0) + 1);

			if (this.changes) {
				this.changes.providedItems.set(itemType, (this.changes.providedItems.get(itemType) ?? 0) + 1);
			}
		}
	}

	public tryUseProvidedItems(itemType: ItemType): boolean {
		const available = this.state.providedItems.get(itemType) ?? 0;
		if (available > 0) {
			this.state.providedItems.set(itemType, available - 1);

			if (this.changes) {
				this.changes.providedItems.set(itemType, (this.changes.providedItems.get(itemType) ?? 0) - 1);
			}

			return true;
		}

		return false;
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
