import Context from "../../../../Context";
import { ObjectiveExecutionResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
export default class AcquireUseOrbOfInfluence extends Objective {
    readonly ignoreInvalidPlans = true;
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
