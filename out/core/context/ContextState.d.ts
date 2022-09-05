import type { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ReserveType } from "../ITars";
import { HashCodeFiltering } from "../objective/IObjective";
export default class ContextState {
    depth: number;
    includeHashCode: boolean;
    minimumAcceptedDifficulty?: number | undefined;
    reservedItems?: Map<Item, ReserveType> | undefined;
    reservedItemTypesPerObjectiveHashCode?: Map<ItemType, Set<string>> | undefined;
    reservedItemsPerObjectiveHashCode?: Map<Item, Set<string>> | undefined;
    providedItems?: Map<ItemType, number> | undefined;
    data?: Map<string, any> | undefined;
    constructor(depth?: number, includeHashCode?: boolean, minimumAcceptedDifficulty?: number | undefined, reservedItems?: Map<Item, ReserveType> | undefined, reservedItemTypesPerObjectiveHashCode?: Map<ItemType, Set<string>> | undefined, reservedItemsPerObjectiveHashCode?: Map<Item, Set<string>> | undefined, providedItems?: Map<ItemType, number> | undefined, data?: Map<string, any> | undefined);
    get shouldIncludeHashCode(): boolean;
    merge(state: ContextState): void;
    reset(): void;
    get<T = any>(type: string): T | undefined;
    set<T = any>(type: string, value: T | undefined): void;
    addReservedItemTypeForObjectiveHashCode(itemType: ItemType, objectiveHashCode?: string): void;
    addReservedItemForObjectiveHashCode(item: Item, objectiveHashCode: string): void;
    clone(increaseDepth: boolean): ContextState;
    getHashCode(): string;
    getFilteredHashCode(filter: HashCodeFiltering): string;
}
