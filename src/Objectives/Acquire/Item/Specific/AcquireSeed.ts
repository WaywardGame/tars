
import Context from "../../../../Context";
import { ObjectiveExecutionResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
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
