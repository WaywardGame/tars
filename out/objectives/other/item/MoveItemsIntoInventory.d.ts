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
import { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import Tile from "@wayward/game/game/tile/Tile";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class MoveItemsIntoInventory extends Objective {
    private readonly tile?;
    private readonly targetContainer?;
    private readonly items;
    constructor(itemOrItems: Item | Item[] | undefined, tile?: Tile | undefined, targetContainer?: IContainer | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
