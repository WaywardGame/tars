import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class RecoverHunger extends Objective {
    private readonly onlyUseAvailableItems;
    private readonly exceededThreshold;
    constructor(onlyUseAvailableItems: boolean, exceededThreshold: boolean);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getFoodItemsInInventory;
    private getFoodItemsInBase;
    private eatItem;
}
