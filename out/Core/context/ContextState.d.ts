import type { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
export default class ContextState {
    depth: number;
    includeHashCode: boolean;
    minimumAcceptedDifficulty?: number | undefined;
    readonly softReservedItems: Set<Item>;
    readonly hardReservedItems: Set<Item>;
    readonly reservedItemTypes: Set<ItemType>;
    readonly providedItems: Map<ItemType, number>;
    data?: Map<string, any> | undefined;
    constructor(depth?: number, includeHashCode?: boolean, minimumAcceptedDifficulty?: number | undefined, softReservedItems?: Set<Item>, hardReservedItems?: Set<Item>, reservedItemTypes?: Set<ItemType>, providedItems?: Map<ItemType, number>, data?: Map<string, any> | undefined);
    get shouldIncludeHashCode(): boolean;
    merge(state: ContextState): void;
    reset(): void;
    get<T = any>(type: string): T | undefined;
    set<T = any>(type: string, value: T | undefined): void;
    clone(increaseDepth: boolean): ContextState;
    getHashCode(): string;
    getFilteredHashCode(allowedItemTypes: Set<ItemType>): string;
}
