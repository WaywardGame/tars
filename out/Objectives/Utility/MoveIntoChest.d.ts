import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class MoveIntoChest extends Objective {
    private readonly itemsToMove?;
    private readonly maxChestDistance?;
    constructor(itemsToMove?: Item[] | undefined, maxChestDistance?: number | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
