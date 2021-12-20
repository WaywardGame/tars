import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import { BaseInfoKey } from "../../../ITars";
import Objective from "../../../Objective";
export default class AcquireBuildMoveToFire extends Objective {
    private readonly baseInfoKey?;
    constructor(baseInfoKey?: BaseInfoKey | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
