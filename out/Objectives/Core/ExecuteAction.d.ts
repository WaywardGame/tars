import type ActionExecutor from "game/entity/action/ActionExecutor";
import type actionDescriptions from "game/entity/action/Actions";
import type { IActionDescription } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
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
