import ActionExecutor from "game/entity/action/ActionExecutor";
import actionDescriptions from "game/entity/action/Actions";
import { ActionType, IActionDescription } from "game/entity/action/IAction";
import Context from "../Context";
import { ObjectiveResult } from "../IObjective";
declare class ActionUtilities {
    private pendingActions;
    executeAction<T extends ActionType>(context: Context, actionType: T, executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never) => ObjectiveResult): Promise<ObjectiveResult>;
    postExecuteAction(actionType: ActionType): void;
    private waitForAction;
}
export declare const actionUtilities: ActionUtilities;
export {};
