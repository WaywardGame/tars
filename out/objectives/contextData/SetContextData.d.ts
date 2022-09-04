import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class SetContextData extends Objective {
    private readonly type;
    private readonly value;
    readonly includePositionInHashCode: boolean;
    constructor(type: string, value: any | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
