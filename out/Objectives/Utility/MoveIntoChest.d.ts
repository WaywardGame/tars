import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class MoveIntoChest extends Objective {
    private readonly itemsToMove?;
    private readonly maxChestDistance?;
    constructor(itemsToMove?: Item[] | undefined, maxChestDistance?: number | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
