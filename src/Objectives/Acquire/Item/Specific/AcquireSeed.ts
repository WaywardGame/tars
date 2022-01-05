
import Context from "../../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import { itemUtilities } from "../../../../utilities/Item";
import AcquireItem from "../AcquireItem";

export default class AcquireSeed extends Objective {

    public getIdentifier(): string {
        return "AcquireSeed";
    }

    public getStatus(): string | undefined {
        return "Acquiring a seed";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return Array.from(itemUtilities.seedItemTypes).map(itemType => [new AcquireItem(itemType, { requiredMinDur: 1 }).passAcquireData(this)]);
    }

}
