import type { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { HashCodeFiltering } from "../objective/IObjective";
export default class ContextState {
    depth: number;
    includeHashCode: boolean;
    minimumAcceptedDifficulty?: number | undefined;
    readonly softReservedItems: Set<Item>;
    readonly hardReservedItems: Set<Item>;
    readonly reservedItemTypesPerObjectiveHashCode: Map<ItemType, Set<string>>;
    readonly reservedItemsPerObjectiveHashCode: Map<Item, Set<string>>;
    readonly providedItems: Map<ItemType, number>;
    data?: Map<string, any> | undefined;
    constructor(depth?: number, includeHashCode?: boolean, minimumAcceptedDifficulty?: number | undefined, softReservedItems?: Set<Item>, hardReservedItems?: Set<Item>, reservedItemTypesPerObjectiveHashCode?: Map<ItemType, Set<string>>, reservedItemsPerObjectiveHashCode?: Map<Item, Set<string>>, providedItems?: Map<ItemType, number>, data?: Map<string, any> | undefined);
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
