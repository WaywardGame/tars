import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { IInventoryItems } from "../../core/ITars";
import Objective from "../../core/objective/Objective";
export default class UpgradeInventoryItem extends Objective {
    private readonly upgrade;
    constructor(upgrade: keyof IInventoryItems);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private addUpgradeObjectives;
}
