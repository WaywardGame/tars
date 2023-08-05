/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import { ActionArguments, ActionType, AnyActionDescription } from "game/entity/action/IAction";
import Message from "language/dictionary/Message";
import type Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";
export type GetActionArguments<T extends AnyActionDescription, AV = ActionArguments<T>> = AV | ((context: Context) => AV | ObjectiveResult.Complete | ObjectiveResult.Restart);
export declare class ActionUtilities {
    private pendingActions;
    executeAction<T extends AnyActionDescription>(context: Context, action: T, args: GetActionArguments<T>, expectedMessages?: Set<Message>, expectedCannotUseResult?: ObjectiveResult): Promise<ObjectiveResult>;
    postExecuteAction(actionType: ActionType): void;
    private waitForAction;
}
