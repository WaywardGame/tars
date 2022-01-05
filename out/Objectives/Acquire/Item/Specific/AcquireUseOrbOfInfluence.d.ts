import Context from "../../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
export default class AcquireUseOrbOfInfluence extends Objective {
    readonly ignoreInvalidPlans = true;
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
