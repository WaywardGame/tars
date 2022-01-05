import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
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
