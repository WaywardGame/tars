import { ItemType } from "game/item/IItem";

export default class ContextState {

	constructor(
		public depth: number = 0,
		public includeHashCode: boolean = false,
		public minimumAcceptedDifficulty?: number | undefined,
		public readonly reservedItems: Set<number> = new Set(),
		public readonly reservedItemTypes: Set<ItemType> = new Set(),
		public readonly providedItems: Map<ItemType, number> = new Map(),

		/**
		 * Dynamic data available during objective execution
		 */
		public data?: Map<string, any> | undefined) {
	}

	public get shouldIncludeHashCode(): boolean {
		return this.includeHashCode || this.reservedItems.size > 0 || this.reservedItemTypes.size > 0 || this.providedItems.size > 0;
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

		for (const item of state.providedItems) {
			// todo: add numbers when merging this?
			this.providedItems.set(item[0], (this.providedItems.get(item[0]) ?? 0) + item[1]);
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
		this.providedItems.clear();
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
			new Map(this.providedItems),
			this.data ? new Map(this.data) : undefined);
	}

	public getHashCode(): string {
		let hashCode = "";

		if (this.reservedItems.size > 0) {
			hashCode += `Reserved: ${Array.from(this.reservedItems).map(id => id).join(",")}`;
		}

		if (this.providedItems.size > 0) {
			hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
		}

		return hashCode;
	}
}
