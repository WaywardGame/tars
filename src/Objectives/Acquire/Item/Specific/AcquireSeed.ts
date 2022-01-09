
import type Context from "../../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import AcquireItem from "../AcquireItem";

export default class AcquireSeed extends Objective {

    public getIdentifier(): string {
        return "AcquireSeed";
    }

    public getStatus(): string | undefined {
        return "Acquiring a seed";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return Array.from(context.utilities.item.seedItemTypes).map(itemType => [new AcquireItem(itemType, { requiredMinDur: 1 }).passAcquireData(this)]);
    }

}
