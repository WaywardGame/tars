import ActionExecutor from "game/entity/action/ActionExecutor";
import actionDescriptions from "game/entity/action/Actions";
import { ActionType, IActionDescription } from "game/entity/action/IAction";
import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
export default class ExecuteAction<T extends ActionType> extends Objective {
    private readonly actionType;
    private readonly executor;
    constructor(actionType: T, executor: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never)) => ObjectiveResult);
    getIdentifier(): string;
    getStatus(): string | undefined;
    isDynamic(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
