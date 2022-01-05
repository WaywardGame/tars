import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class Lambda extends Objective {
    private readonly lambda;
    private readonly difficulty;
    constructor(lambda: (context: Context, lambda: Lambda) => Promise<ObjectiveExecutionResult>, difficulty?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
