import Context from "../../../../Context";
import { ObjectiveExecutionResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
export default class AcquireWaterContainer extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
