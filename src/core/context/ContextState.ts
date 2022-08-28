import type { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { HashCodeFiltering } from "../objective/IObjective";

export default class ContextState {

	constructor(
		public depth: number = 0,
		public includeHashCode: boolean = false,
		public minimumAcceptedDifficulty?: number | undefined,
		public readonly softReservedItems: Set<Item> = new Set(), // items that will be used but not consumed
		public readonly hardReservedItems: Set<Item> = new Set(), // items that will be used and consumed
		public readonly reservedItemTypes: Set<ItemType> = new Set(),
		public readonly reservedItemTypesPerObjectiveHashCode: Map<ItemType, Set<string>> = new Map(),
		public readonly providedItems: Map<ItemType, number> = new Map(),

		/**
		 * Dynamic data available during objective execution
		 */
		public data?: Map<string, any> | undefined) {
	}

	public get shouldIncludeHashCode(): boolean {
		return this.includeHashCode || this.softReservedItems.size > 0 || this.hardReservedItems.size > 0 || this.reservedItemTypes.size > 0 || this.providedItems.size > 0;
	}

	public merge(state: ContextState): void {
		if (state.includeHashCode) {
			this.includeHashCode = true;
		}

		for (const item of state.softReservedItems) {
			this.softReservedItems.add(item);
		}

		for (const item of state.hardReservedItems) {
			this.hardReservedItems.add(item);
		}

		for (const itemType of state.reservedItemTypes) {
			this.reservedItemTypes.add(itemType);
		}

		for (const [itemType, objectiveHashCodes] of state.reservedItemTypesPerObjectiveHashCode) {
			let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
			if (!existingSet) {
				existingSet = new Set(objectiveHashCodes);
				this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);

			} else {
				for (const objectiveHashCode of objectiveHashCodes) {
					existingSet.add(objectiveHashCode);
				}
			}
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
		this.softReservedItems.clear();
		this.hardReservedItems.clear();
		this.reservedItemTypes.clear();
		this.reservedItemTypesPerObjectiveHashCode.clear();
		this.providedItems.clear();
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

	public addReservedItemTypesForObjectiveHashCode(itemType: ItemType, objectiveHashCode: string) {
		let existingSet = this.reservedItemTypesPerObjectiveHashCode.get(itemType);
		if (!existingSet) {
			existingSet = new Set([objectiveHashCode]);
			this.reservedItemTypesPerObjectiveHashCode.set(itemType, existingSet);

		} else {
			existingSet.add(objectiveHashCode);
		}
	}

	public clone(increaseDepth: boolean): ContextState {
		return new ContextState(
			increaseDepth ? this.depth + 1 : this.depth,
			this.includeHashCode,
			this.minimumAcceptedDifficulty,
			new Set(this.softReservedItems),
			new Set(this.hardReservedItems),
			new Set(this.reservedItemTypes),
			new Map(this.reservedItemTypesPerObjectiveHashCode),
			new Map(this.providedItems),
			this.data ? new Map(this.data) : undefined);
	}

	public getHashCode(): string {
		let hashCode = "";

		if (this.softReservedItems.size > 0) {
			hashCode += `Soft Reserved: ${Array.from(this.softReservedItems).map(item => item.id).join(",")}`;
		}

		if (this.hardReservedItems.size > 0) {
			hashCode += `Hard Reserved: ${Array.from(this.hardReservedItems).map(item => item.id).join(",")}`;
		}

		if (this.providedItems.size > 0) {
			hashCode += `Provided: ${Array.from(this.providedItems).map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
		}

		return hashCode;
	}

	public getFilteredHashCode(filter: HashCodeFiltering): string {
		let hashCode = "";

		if (filter instanceof Set) {
			const allowedItemTypes = filter;

			if (this.softReservedItems.size > 0) {
				const filteredSoftReservedItems = Array.from(this.softReservedItems).filter(item => allowedItemTypes.has(item.type));
				if (filteredSoftReservedItems.length > 0) {
					hashCode += `Soft Reserved: ${filteredSoftReservedItems.map(item => item.id).join(",")}`;
				}
			}

			if (this.hardReservedItems.size > 0) {
				const filteredHardReservedItems = Array.from(this.hardReservedItems).filter(item => allowedItemTypes.has(item.type));
				if (filteredHardReservedItems.length > 0) {
					hashCode += `Hard Reserved: ${filteredHardReservedItems.map(item => item.id).join(",")}`;
				}
			}

			if (this.providedItems.size > 0) {
				const filteredProvidedItems = Array.from(this.providedItems).filter(itemType => allowedItemTypes.has(itemType[0]));
				if (filteredProvidedItems.length > 0) {
					hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
				}
			}

		} else {
			const objectiveHashCode = filter.objectiveHashCode;
			const allowedItemTypes = filter.itemTypes;

			if (this.softReservedItems.size > 0) {
				const filteredSoftReservedItems = Array.from(this.softReservedItems)
					.filter(item => allowedItemTypes.has(item.type) && this.reservedItemTypesPerObjectiveHashCode.get(item.type)?.has(objectiveHashCode));
				if (filteredSoftReservedItems.length > 0) {
					hashCode += `Soft Reserved: ${filteredSoftReservedItems.map(item => item.id).join(",")}`;
				}
			}

			if (this.hardReservedItems.size > 0) {
				const filteredHardReservedItems = Array.from(this.hardReservedItems)
					.filter(item => allowedItemTypes.has(item.type) && this.reservedItemTypesPerObjectiveHashCode.get(item.type)?.has(objectiveHashCode));
				if (filteredHardReservedItems.length > 0) {
					hashCode += `Hard Reserved: ${filteredHardReservedItems.map(item => item.id).join(",")}`;
				}
			}

			if (this.providedItems.size > 0) {
				const filteredProvidedItems = Array.from(this.providedItems)
					.filter(([itemType]) => allowedItemTypes.has(itemType) && this.reservedItemTypesPerObjectiveHashCode.get(itemType)?.has(objectiveHashCode));
				if (filteredProvidedItems.length > 0) {
					hashCode += `Provided: ${filteredProvidedItems.map(itemType => `${itemType[0]}:${itemType[1]}`).join(",")}`;
				}
			}
		}

		return hashCode;
	}
}
