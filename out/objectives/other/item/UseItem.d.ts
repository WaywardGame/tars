import { ActionArgument, IActionDescription } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import type Context from "../../../core/context/Context";
import { IInventoryItems } from "../../../core/ITars";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export declare type UseItemActionDescriptions = IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory]> | IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]> | IActionDescription<[[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]]> | IActionDescription<[[ActionArgument.ItemNearby, ActionArgument.Doodad, ActionArgument.Undefined]]> | IActionDescription<[ActionArgument.ItemInventory, [ActionArgument.ItemInventory, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined]]>;
export default class UseItem<T extends UseItemActionDescriptions> extends Objective {
    private readonly action;
    private readonly item?;
    constructor(action: T, item?: Item | keyof IInventoryItems | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
