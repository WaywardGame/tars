import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { IInventoryItems } from "../../ITars";
import Objective from "../../Objective";
export default class UpgradeInventoryItem extends Objective {
    private readonly upgrade;
    constructor(upgrade: keyof IInventoryItems);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private addUpgradeObjectives;
}
