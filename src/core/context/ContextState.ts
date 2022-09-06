import type { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ReserveType } from "../ITars";
import { HashCodeFiltering } from "../objective/IObjective";

export default class ContextState {

	constructor(
		public depth: number = 0,
		public includeHashCode: boolean = false,
		public minimumAcceptedDifficulty?: number | undefined,
		public reservedItems?: Map<Item, ReserveType>,
		public reservedItemTypesPerObjectiveHashCode?: Map<ItemType, Set<string>>,
		public reservedItemsPerObjectiveHashCode?: Map<Item, Set<string>>,
		public providedItems?: Map<ItemType, number>,

		/**
		 * Dynamic data available during objective execution
		 */
		public data?: Map<string, any> | undefined) {
	}

	public get shouldIncludeHashCode(): boolean {
		return this.includeHashCode || this.reservedItems !== undefined || this.reservedItemTypesPerObjectiveHashCode !== undefined || this.providedItems !== undefined;
	}

	public merge(state: ContextState): void {
		if (state.includeHashCode) {
			this.includeHashCode = true;
		}

		if (state.reservedItems) {
			this.reservedItems ??= new Map();

			for (const [k, v] of state.reservedItems) {
				this.reservedItems.set(k, v);
			}
		}

		if (state.reservedItemTypesPerObjectiveHashCode) {
			this.reservedItemTypesPerObjectiveHashCode ??= new Map();

			for (const [itemType, objectiveHashCodes] of state.reservedItemTypesPerObjectiveHashCode) {
				const existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
				if (!existingSet) {
					this.reservedItemTypesPerObjectiveHashCode.set(itemType, new Set(objectiveHashCodes));

				} else {
					for (const objectiveHashCode of objectiveHashCodes) {
						existingSet.add(objectiveHashCode);
					}
				}
			}
		}

		if (state.reservedItemsPerObjectiveHashCode) {
			this.reservedItemsPerObjectiveHashCode ??= new Map();

			for (const [item, objectiveHashCodes] of state.reservedItemsPerObjectiveHashCode) {
				const existingSet = this.reservedItemsPerObjectiveHashCode.get(item);
				if (!existingSet) {
					this.reservedItemsPerObjectiveHashCode.set(item, new Set(objectiveHashCodes));

				} else {
					for (const objectiveHashCode of objectiveHashCodes) {
						existingSet.add(objectiveHashCode);
					}
				}
			}
		}

		if (state.providedItems) {
			this.providedItems ??= new Map();

			for (const [itemType, amount] of state.providedItems) {
				const newValue = (this.providedItems.get(itemType) ?? 0) + amount;
				if (newValue !== 0) {
					this.providedItems.set(itemType, newValue);

				} else {
					this.providedItems.delete(itemType);
				}
			}

			if (this.providedItems.size === 0) {
				this.providedItems = undefined;
			}
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
		this.reservedItems = undefined;
		this.reservedItemTypesPerObjectiveHashCode = undefined;
		this.reservedItemsPerObjectiveHashCode = undefined;
		this.providedItems = undefined;
		this.data = undefined;
	}

	public get<T = any>(type: string): T | undefined {
		return this.data?.get(type);
	}

	public set<T = any>(type: string, value: T | undefined) {
		if (value !== undefined) {
			if (!this.data) {
				this.data = new Map();
			}

			this.data.set(type, value);

		} else if (this.data?.delete(type) && this.data.size === 0) {
			this.data = undefined;
		}
	}

	public addReservedItemTypeForObjectiveHashCode(itemType: ItemType, objectiveHashCode: string = "") {
		this.reservedItemTypesPerObjectiveHashCode ??= new Map();

		let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
		if (!existingSet) {
			existingSet = new Set([objectiveHashCode]);
			this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);

		} else {
			existingSet.add(objectiveHashCode);
		}
	}

	public addReservedItemForObjectiveHashCode(item: Item, objectiveHashCode: string) {
		this.addReservedItemTypeForObjectiveHashCode(item.type, objectiveHashCode);

		this.reservedItemsPerObjectiveHashCode ??= new Map();

		let existingSet = this.reservedItemsPerObjectiveHashCode.get(item);
		if (!existingSet) {
			existingSet = new Set([objectiveHashCode]);
			this.reservedItemsPerObjectiveHashCode.set(item, existingSet);

		} else {
			existingSet.add(objectiveHashCode);
		}
	}

	public clone(increaseDepth: boolean): ContextState {
		return new ContextState(
			increaseDepth ? this.depth + 1 : this.depth,
			this.includeHashCode,
			this.minimumAcceptedDifficulty,
			this.reservedItems ? new Map(this.reservedItems) : undefined,
			this.reservedItemTypesPerObjectiveHashCode ? new Map(this.reservedItemTypesPerObjectiveHashCode) : undefined,
			this.reservedItemsPerObjectiveHashCode ? new Map(this.reservedItemsPerObjectiveHashCode) : undefined,
			this.providedItems ? new Map(this.providedItems) : undefined,
			this.data ? new Map(this.data) : undefined);
	}

	public getHashCode(): string {
		let hashCode = "";

		if (this.reservedItems) {
			hashCode += `Reserved: ${Array.from(this.reservedItems).map(reserved => `${reserved[0]}:${reserved[1]}`).join(",")}`;
		}

		if (this.providedItems) {
			hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
		}

		return hashCode;
	}

	public getFilteredHashCode(filter: HashCodeFiltering): string {
		let hashCode = "";

		if (filter instanceof Set) {
			const allowedItemTypes = filter;

			if (this.reservedItems) {
				const filteredReservedItems = Array.from(this.reservedItems).filter(reserved => allowedItemTypes.has(reserved[0].type));
				if (filteredReservedItems.length > 0) {
					hashCode += `Reserved: ${filteredReservedItems.map(reserved => reserved[0].id).join(",")}`;
				}
			}

			if (this.providedItems) {
				const filteredProvidedItems = Array.from(this.providedItems).filter(itemType => allowedItemTypes.has(itemType[0]));
				if (filteredProvidedItems.length > 0) {
					hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
				}
			}

		} else {
			const objectiveHashCode = filter.objectiveHashCode;
			const allowedItemTypes = filter.itemTypes;

			if (this.reservedItems) {
				const filteredReservedItems = Array.from(this.reservedItems)
					.filter(reserved => allowedItemTypes.has(reserved[0].type) && this.reservedItemsPerObjectiveHashCode?.get(reserved[0])?.has(objectiveHashCode));
				if (filteredReservedItems.length > 0) {
					hashCode += `Reserved: ${filteredReservedItems.map(reserved => reserved[0].id).join(",")}`;
				}
			}

			if (this.providedItems) {
				const filteredProvidedItems = Array.from(this.providedItems)
					.filter(([itemType]) => allowedItemTypes.has(itemType)); // && this.reservedItemTypesPerObjectiveHashCode.get(itemType)?.has(objectiveHashCode)
				if (filteredProvidedItems.length > 0) {
					hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
				}
			}
		}

		return hashCode;
	}
}
