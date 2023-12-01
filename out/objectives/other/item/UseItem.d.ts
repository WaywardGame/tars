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
import { ActionArgument, IActionDescription } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";
import type Context from "../../../core/context/Context";
import { IInventoryItems } from "../../../core/ITars";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export type UseItemActionDescriptions = IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory]> | IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]> | IActionDescription<[[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]]> | IActionDescription<[[ActionArgument.Undefined, ActionArgument.ItemNearby, ActionArgument.Doodad]]> | IActionDescription<[[ActionArgument.ItemNearby, ActionArgument.Doodad, ActionArgument.Undefined]]> | IActionDescription<[ActionArgument.ItemInventory, [ActionArgument.ItemInventory, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined]]>;
export default class UseItem<T extends UseItemActionDescriptions> extends Objective {
    private readonly action;
    private readonly item?;
    constructor(action: T, item?: Item | keyof IInventoryItems | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
