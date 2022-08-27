import { ActionArguments, ActionType, AnyActionDescription } from "game/entity/action/IAction";
import Message from "language/dictionary/Message";
import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";
export declare type GetActionArguments<T extends AnyActionDescription, AV = ActionArguments<T>> = AV | ((context: Context) => AV | ObjectiveResult.Complete | ObjectiveResult.Restart);
export declare class ActionUtilities {
    private pendingActions;
    executeAction<T extends AnyActionDescription>(context: Context, action: T, args: GetActionArguments<T>, expectedMessages?: Set<Message>, expectedCannotUseResult?: ObjectiveResult): Promise<ObjectiveResult>;
    postExecuteAction(actionType: ActionType): void;
    private waitForAction;
}
