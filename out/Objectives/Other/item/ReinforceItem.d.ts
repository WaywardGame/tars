import Item from "game/item/Item";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class ReinforceItem extends Objective {
    private readonly item;
    private readonly options;
    constructor(item: Item, options?: Partial<{
        minWorth: number;
        targetDurabilityMultipler: number;
    }>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
