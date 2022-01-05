import Item from "game/item/Item";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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
