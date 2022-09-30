import type Context from "../../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
export default class AcquireWaterContainer extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
