import Context from "../../../core/context/Context";
import { BaseInfoKey } from "../../../core/ITars";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class AcquireBuildMoveToFire extends Objective {
    private readonly baseInfoKey?;
    constructor(baseInfoKey?: BaseInfoKey | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
