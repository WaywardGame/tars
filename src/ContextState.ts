
export default class ContextState {

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
