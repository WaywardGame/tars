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
import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import Tile from "game/tile/Tile";
import Log from "utilities/Log";
import { IBase, IInventoryItems, IUtilities } from "../ITars";
import { ITarsOptions } from "../ITarsOptions";
import { HashCodeFiltering } from "../objective/IObjective";
import Tars from "../Tars";
import ContextState from "./ContextState";
import type { IContext } from "./IContext";
export default class Context implements IContext {
    readonly tars: Tars;
    readonly base: IBase;
    readonly inventory: IInventoryItems;
    readonly utilities: IUtilities;
    state: ContextState;
    readonly calculatingDifficulty: boolean;
    private initialState?;
    private changes;
    constructor(tars: Tars, base: IBase, inventory: IInventoryItems, utilities: IUtilities, state?: ContextState, calculatingDifficulty?: boolean, initialState?: ContextState | undefined);
    get human(): import("../../../node_modules/@wayward/types/definitions/game/game/entity/Human").default<number>;
    get island(): import("../../../node_modules/@wayward/types/definitions/game/game/island/Island").default;
    get log(): Log;
    get options(): Readonly<ITarsOptions>;
    toString(): string;
    clone(calculatingDifficulty?: boolean, increaseDepth?: boolean, cloneInitialState?: boolean): Context;
    merge(state: ContextState): void;
    watchForChanges(): ContextState;
    unwatch(): void;
    isReservedItem(item: Item): boolean;
    isSoftReservedItem(item: Item): boolean;
    isHardReservedItem(item: Item): boolean;
    isReservedItemType(itemType: ItemType, objectiveHashCode?: string): boolean;
    hasData(type: string): boolean;
    getData<T = any>(type: string): T | undefined;
    getDataOrDefault<T = any>(type: string, defaultValue: T): T;
    setData<T = any>(type: string, value: T | undefined): void;
    addSoftReservedItems(...items: Item[]): void;
    addSoftReservedItemsForObjectiveHashCode(objectiveHashCode: string, ...items: Item[]): void;
    addHardReservedItems(...items: Item[]): void;
    addHardReservedItemsForObjectiveHashCode(objectiveHashCode: string, ...items: Item[]): void;
    addProvidedItems(itemTypes: ItemType[]): void;
    tryUseProvidedItems(itemType: ItemType): boolean;
    setInitialState(state?: ContextState): void;
    setInitialStateData<T = any>(type: string, value: T | undefined): void;
    reset(): void;
    resetPosition(): void;
    getHashCode(): string;
    getFilteredHashCode(filter: HashCodeFiltering): string;
    markShouldIncludeHashCode(): void;
    isPlausible(difficulty: number, requireMinimumAcceptedDifficulty?: boolean): boolean;
    getTile(): Tile;
}
