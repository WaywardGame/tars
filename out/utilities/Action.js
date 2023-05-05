define(["require", "exports", "game/entity/action/IAction", "language/dictionary/Message", "../core/objective/IObjective"], function (require, exports, IAction_1, Message_1, IObjective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionUtilities = void 0;
    class ActionUtilities {
        constructor() {
            this.pendingActions = {};
        }
        async executeAction(context, action, args, expectedMessages, expectedCannotUseResult = IObjective_1.ObjectiveResult.Restart) {
            if (!game.playing) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (context.options.freeze) {
                return IObjective_1.ObjectiveResult.Pending;
            }
            let waiter;
            if (context.human.hasDelay()) {
                await new Promise(resolve => {
                    const checker = () => {
                        if (!context.human.hasDelay()) {
                            resolve();
                            return;
                        }
                        setTimeout(checker, 5);
                    };
                    checker();
                });
            }
            if (!game.playing) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const actionType = action.type;
            const actionArgs = typeof (args) === "function" ? args(context) : args;
            if (typeof (actionArgs) === "number") {
                return actionArgs;
            }
            const canUseResult = action.canUse(context.human, ...actionArgs);
            if (!canUseResult.usable) {
                if (canUseResult.message !== undefined && expectedMessages?.has(canUseResult.message)) {
                    return expectedCannotUseResult;
                }
                context.log.warn(`Tried to use an action that is not usable. Action: ${IAction_1.ActionType[actionType]}. Arguments: ${actionArgs.join(", ")}. Message: ${Message_1.default[canUseResult.message]}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (multiplayer.isConnected()) {
                waiter = this.waitForAction(actionType);
            }
            multiplayer.executeClientside(() => {
                action.skipConfirmation().execute(context.human, ...actionArgs);
            });
            if (waiter) {
                await waiter;
            }
            return IObjective_1.ObjectiveResult.Complete;
        }
        postExecuteAction(actionType) {
            const pendingAction = this.pendingActions[actionType];
            if (pendingAction) {
                window.clearTimeout(pendingAction.rejectorTimeoutId);
                delete this.pendingActions[actionType];
                pendingAction.resolve(true);
            }
        }
        async waitForAction(actionType) {
            return new Promise(resolve => {
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
    exports.ActionUtilities = ActionUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVFBLE1BQWEsZUFBZTtRQUE1QjtZQUVZLG1CQUFjLEdBR2pCLEVBQUUsQ0FBQztRQThGWixDQUFDO1FBNUZVLEtBQUssQ0FBQyxhQUFhLENBQ3RCLE9BQWdCLEVBQ2hCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsMEJBQTJDLDRCQUFlLENBQUMsT0FBTztZQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUNsQztZQUVELElBQUksTUFBb0MsQ0FBQztZQUV6QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUU7b0JBQzlCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTt3QkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7NEJBQzNCLE9BQU8sRUFBRSxDQUFDOzRCQUNWLE9BQU87eUJBQ1Y7d0JBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDM0IsQ0FBQyxDQUFDO29CQUVGLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUMsQ0FBQyxDQUFDO2FBQ047WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDZixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUssQ0FBQztZQUVoQyxNQUFNLFVBQVUsR0FBRyxP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