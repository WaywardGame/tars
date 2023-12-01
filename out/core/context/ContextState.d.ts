/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type { ItemType } from "@wayward/game/game/item/IItem";
import Item from "@wayward/game/game/item/Item";
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
    has(type: string): boolean;
    get<T = any>(type: string): T | undefined;
    set<T = any>(type: string, value: T | undefined, trackUndefined?: boolean): void;
    addReservedItemTypeForObjectiveHashCode(itemType: ItemType, objectiveHashCode?: string): void;
    addReservedItemForObjectiveHashCode(item: Item, objectiveHashCode: string): void;
    clone(increaseDepth: boolean): ContextState;
    getHashCode(): string;
    getFilteredHashCode(filter: HashCodeFiltering): string;
}
