import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import Log from "utilities/Log";
import type { IVector3 } from "utilities/math/IVector";
import Vector3 from "utilities/math/Vector3";

import { IBase, IInventoryItems, IUtilities, ReserveType } from "../ITars";
import { ITarsOptions } from "../ITarsOptions";
import { HashCodeFiltering } from "../objective/IObjective";
import Tars from "../Tars";
import ContextState from "./ContextState";
import type { IContext } from "./IContext";
import { ContextDataType } from "./IContext";

export default class Context implements IContext {

	private changes: ContextState | undefined;

	constructor(
		public readonly tars: Tars,
		public readonly base: IBase,
		public readonly inventory: IInventoryItems,
		public readonly utilities: IUtilities,
		public state = new ContextState(),
		public readonly calculatingDifficulty: boolean = false,
		private initialState?: ContextState) {
	}

	public get human() {
		return this.tars.human;
	}

	public get island() {
		return this.tars.human.island;
	}

	public get log(): Log {
		return this.utilities.logger.log;
	}

	public get options(): Readonly<ITarsOptions> {
		return this.tars.saveData.options;
	}

	public toString() {
		return `Context: ${this.getHashCode()}. Initial state: ${this.initialState ? this.initialState.getHashCode() : ""}. Data: ${this.state.data ? Array.from(this.state.data.keys()).join(",") : undefined}`;
	}

	public clone(calculatingDifficulty: boolean = false, increaseDepth: boolean = false, cloneInitialState?: boolean): Context {
		return new Context(
			this.tars,
			this.base,
			this.inventory,
			this.utilities,
			this.state.clone(increaseDepth),
			calculatingDifficulty,
			cloneInitialState ? this.initialState?.clone(increaseDepth) : this.initialState);
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
		if (this.state.reservedItems?.has(item)) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is not going to be consumed
	 */
	public isSoftReservedItem(item: Item) {
		if (this.state.reservedItems?.get(item) === ReserveType.Soft) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if the item is reserved by another objective and is going to be consumed
	 */
	public isHardReservedItem(item: Item) {
		if (this.state.reservedItems?.get(item) === ReserveType.Hard) {
			this.markShouldIncludeHashCode();
			return true;
		}

		return false;
	}

	/**
	 * Checks if an item with the given item type is reserved by another objective
	 * @param objectiveHashCode When provided, check if the item type is reserved due to an objective matching the provided hash code
	 */
	public isReservedItemType(itemType: ItemType, objectiveHashCode?: string): boolean {
		const objectiveHashCodes = this.state.reservedItemTypesPerObjectiveHashCode?.get(itemType);
		return objectiveHashCodes !== undefined && (!objectiveHashCode || objectiveHashCodes?.has(objectiveHashCode));
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
		this.state.reservedItems ??= new Map();

		for (const item of items) {
			if (this.state.reservedItems.get(item) === ReserveType.Hard) {
				// console.warn("already hard reserved", item, this.state.reservedItems.get(item));

				if (this.changes && (!this.changes.reservedItems || this.changes.reservedItems.get(item) !== ReserveType.Hard)) {
					this.changes.reservedItems ??= new Map();
					this.changes.reservedItems.set(item, ReserveType.Soft);
					this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
				}

				continue;
			}

			this.state.reservedItems.set(item, ReserveType.Soft);
			this.state.addReservedItemTypeForObjectiveHashCode(item.type);

			if (this.changes) {
				this.changes.reservedItems ??= new Map();
				this.changes.reservedItems.set(item, ReserveType.Soft);
				this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
			}
		}
	}

	public addSoftReservedItemsForObjectiveHashCode(objectiveHashCode: string, ...items: Item[]) {
		this.state.reservedItems ??= new Map();

		for (const item of items) {
			if (this.state.reservedItems.get(item) === ReserveType.Hard) {
				// console.warn("already hard reserved", item, this.state.reservedItems.get(item));

				if (this.changes && (!this.changes.reservedItems || this.changes.reservedItems.get(item) !== ReserveType.Hard)) {
					this.changes.reservedItems ??= new Map();
					this.changes.reservedItems.set(item, ReserveType.Soft);
					this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
				}

				continue;
			}

			this.state.reservedItems.set(item, ReserveType.Soft);
			this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);

			if (this.changes) {
				this.changes.reservedItems ??= new Map();
				this.changes.reservedItems.set(item, ReserveType.Soft);
				this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
			}
		}
	}

	public addHardReservedItems(...items: Item[]) {
		this.state.reservedItems ??= new Map();
		if (this.changes) {
			this.changes.reservedItems ??= new Map();
		}

		for (const item of items) {
			// if (this.calculatingDifficulty && this.state.reservedItems.has(item) && this.state.reservedItems.get(item) !== ReserveType.Hard) {
			// 	console.warn("alrady resered3", item, this.state.reservedItems.get(item), ReserveType.Hard);
			// 	debugger;
			// }
			this.state.reservedItems!.set(item, ReserveType.Hard);
			this.state.addReservedItemTypeForObjectiveHashCode(item.type);

			if (this.changes) {
				this.changes.reservedItems!.set(item, ReserveType.Hard);
				this.changes.addReservedItemTypeForObjectiveHashCode(item.type);
			}
		}
	}

	public addHardReservedItemsForObjectiveHashCode(objectiveHashCode: string, ...items: Item[]) {
		this.state.reservedItems ??= new Map();
		if (this.changes) {
			this.changes.reservedItems ??= new Map();
		}

		for (const item of items) {
			// if (this.calculatingDifficulty && this.state.reservedItems.has(item) && this.state.reservedItems.get(item) !== ReserveType.Hard) {
			// 	console.warn("alrady resered4", item, this.state.reservedItems.get(item), ReserveType.Hard);
			// 	debugger;
			// }
			this.state.reservedItems.set(item, ReserveType.Hard);
			this.state.addReservedItemForObjectiveHashCode(item, objectiveHashCode);

			if (this.changes) {
				this.changes.reservedItems!.set(item, ReserveType.Hard);
				this.changes.addReservedItemForObjectiveHashCode(item, objectiveHashCode);
			}
		}
	}

	public addProvidedItems(itemTypes: ItemType[]) {
		this.state.providedItems ??= new Map();
		if (this.changes) {
			this.changes.providedItems ??= new Map();
		}

		for (const itemType of itemTypes) {
			this.state.providedItems.set(itemType, (this.state.providedItems.get(itemType) ?? 0) + 1);

			if (this.changes) {
				this.changes.providedItems!.set(itemType, (this.changes.providedItems!.get(itemType) ?? 0) + 1);
			}
		}
	}

	public tryUseProvidedItems(itemType: ItemType): boolean {
		const available = this.state.providedItems?.get(itemType) ?? 0;
		if (available > 0) {
			const newValue = available - 1;
			this.state.providedItems!.set(itemType, newValue);
			if (newValue === 0 && this.state.providedItems!.delete(itemType) && this.state.providedItems!.size === 0) {
				this.state.providedItems = undefined;
			}

			if (this.changes) {
				this.changes.providedItems ??= new Map();

				const newValue = (this.changes.providedItems.get(itemType) ?? 0) - 1;
				this.changes.providedItems.set(itemType, newValue);
				if (newValue === 0 && this.changes.providedItems.delete(itemType) && this.changes.providedItems.size === 0) {
					this.changes.providedItems = undefined;
				}
			}

			return true;
		}

		return false;
	}

	public setInitialState(state: ContextState = this.state.clone(false)) {
		this.initialState = state;
	}

	public setInitialStateData<T = any>(type: string, value: T | undefined) {
		if (!this.initialState) {
			if (value === undefined) {
				return;
			}

			this.initialState = new ContextState();
		}

		this.initialState.set(type, value);
	}

	public reset() {
		this.changes = undefined;

		if (this.initialState) {
			this.state = this.initialState.clone(false);

		} else {
			this.state.reset();
		}

		this.resetPosition();
	}

	public resetPosition() {
		this.setData(ContextDataType.Position, new Vector3(this.human));
	}

	public getHashCode(): string {
		return this.state.getHashCode();
	}

	public getFilteredHashCode(filter: HashCodeFiltering): string {
		return this.state.getFilteredHashCode(filter);
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
