import Human from "game/entity/Human";
import NPC from "game/entity/npc/NPC";
import type Player from "game/entity/player/Player";
import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import type { IVector3 } from "utilities/math/IVector";
import Vector3 from "utilities/math/Vector3";

import type { IBase, IInventoryItems, IUtilities } from "../ITars";
import { ITarsOptions } from "../ITarsOptions";
import ContextState from "./ContextState";
import type { IContext } from "./IContext";
import { ContextDataType } from "./IContext";

export default class Context implements IContext {

	private changes: ContextState | undefined;

	constructor(
		public readonly human: Human,
		public readonly base: IBase,
		public readonly inventory: IInventoryItems,
		public readonly utilities: IUtilities,
		public readonly options: Readonly<ITarsOptions>,
		public state = new ContextState(),
		public readonly calculatingDifficulty: boolean = false,
		private initialState?: ContextState) {
	}

	public get island() {
		return this.human.island;
	}

	public get actionExecutor(): Player | NPC {
		const executor = this.human.asPlayer ?? this.human.asNPC;
		if (!executor) {
			throw new Error("Invalid human");
		}

		return executor;
	}

	public toString() {
		return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined}`;
	}

	public clone(calculatingDifficulty: boolean = false, increaseDepth: boolean = false): Context {
		return new Context(this.human, this.base, this.inventory, this.utilities, this.options, this.state.clone(increaseDepth), calculatingDifficulty, this.initialState?.clone(increaseDepth));
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
		if (this.state.softReservedItems.has(item) || this.state.hardReservedItems.has(item)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is not going to be consumed
	 */
	public isSoftReservedItem(item: Item) {
		if (this.state.softReservedItems.has(item)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is going to be consumed
	 */
	public isHardReservedItem(item: Item) {
		if (this.state.hardReservedItems.has(item)) {
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
			this.state.softReservedItems.add(item);
			this.state.reservedItemTypes.add(item.type);

			if (this.changes) {
				this.changes.softReservedItems.add(item);
				this.changes.reservedItemTypes.add(item.type);
			}
		}
	}

	public addHardReservedItems(...items: Item[]) {
		for (const item of items) {
			this.state.hardReservedItems.add(item);
			this.state.reservedItemTypes.add(item.type);

			if (this.changes) {
				this.changes.hardReservedItems.add(item);
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

		this.setData(ContextDataType.Position, new Vector3(this.human.getPoint()));
	}

	public getHashCode(): string {
		return this.state.getHashCode();
	}

	public getFilteredHashCode(allowedItemTypes: Set<ItemType>): string {
		return this.state.getFilteredHashCode(allowedItemTypes);
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

	///////////////////////////
	// Helper methods

	public getPosition(): IVector3 {
		// not needed?
		// if (!this.calculatingDifficulty) {
		// 	return this.human.getPoint();
		// }

		const position = this.getData(ContextDataType.Position);
		if (position && (position.x === undefined || position.y === undefined || position.z === undefined)) {
			console.error(`[TARS] getPosition - Invalid value ${position}`);
		}

		return position || this.human.getPoint();
	}
}
