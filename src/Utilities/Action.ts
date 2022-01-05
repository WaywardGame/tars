import ActionExecutor from "game/entity/action/ActionExecutor";
import actionDescriptions from "game/entity/action/Actions";
import { ActionType, IActionDescription } from "game/entity/action/IAction";

import Context from "../core/context/Context";
import { ObjectiveResult } from "../core/objective/IObjective";

class ActionUtilities {

    private pendingActions: {
        [index: number]: {
            rejectorTimeoutId: number;
            resolve(success: boolean): void;
        };
    } = {};

    public async executeAction<T extends ActionType>(
        context: Context,
        actionType: T,
        executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never) => ObjectiveResult): Promise<ObjectiveResult> {
        let waiter: Promise<boolean> | undefined;

        if (context.player.hasDelay()) {
            await new Promise<void>(resolve => {
                const checker = () => {
                    if (!context.player.hasDelay()) {
                        resolve();
                        return;
                    }

                    setTimeout(checker, 5);
                };

                checker();
            });
        }

        if (multiplayer.isConnected()) {
            // the action won't be executed immediately, we need to setup a callback
            waiter = this.waitForAction(actionType);
        }

        const objectiveResult = executor(context, ActionExecutor.get(actionDescriptions[actionType]).skipConfirmation() as any);

        if (waiter) {
            await waiter;
        }

        return objectiveResult;
    }

    public postExecuteAction(actionType: ActionType) {
        const pendingAction = this.pendingActions[actionType];
        if (pendingAction) {
            window.clearTimeout(pendingAction.rejectorTimeoutId);
            delete this.pendingActions[actionType];
            pendingAction.resolve(true);
        }
    }

    private async waitForAction(actionType: ActionType) {
        return new Promise<boolean>(resolve => {
            const rejectorId = window.setTimeout(() => {
                delete this.pendingActions[actionType];
                resolve(false);
            }, 1000);

            this.pendingActions[actionType] = {
                resolve: resolve,
                rejectorTimeoutId: rejectorId,
            };
        });
    }

}

export const actionUtilities = new ActionUtilities();
