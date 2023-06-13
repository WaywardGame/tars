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
import type Human from "game/entity/Human";
import type { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITarsMode } from "../core/mode/IMode";
import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
export declare class AcquireItemMode implements ITarsMode {
    private readonly itemType;
    private finished;
    constructor(itemType: ItemType);
    initialize(_: Context, finished: (success: boolean) => void): Promise<void>;
    determineObjectives(_: Context): Promise<Array<IObjective | IObjective[]>>;
    onInventoryItemAddOrUpdate(_: Human, items: Item[]): void;
}
