define(["require", "exports", "game/entity/action/IAction", "language/dictionary/Message", "../core/objective/IObjective"], function (require, exports, IAction_1, Message_1, IObjective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionUtilities = void 0;
    class ActionUtilities {
        constructor() {
            this.pendingActions = {};
        }
        async executeAction(context, action, args, expectedMessages, expectedCannotUseResult = IObjective_1.ObjectiveResult.Restart) {
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
            action.skipConfirmation().execute(context.human, ...actionArgs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVFBLE1BQWEsZUFBZTtRQUE1QjtZQUVZLG1CQUFjLEdBR2pCLEVBQUUsQ0FBQztRQW9GWixDQUFDO1FBbEZVLEtBQUssQ0FBQyxhQUFhLENBQ3RCLE9BQWdCLEVBQ2hCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsMEJBQTJDLDRCQUFlLENBQUMsT0FBTztZQUNsRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxNQUFvQyxDQUFDO1lBRXpDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtvQkFDOUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO3dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTs0QkFDM0IsT0FBTyxFQUFFLENBQUM7NEJBQ1YsT0FBTzt5QkFDVjt3QkFFRCxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQixDQUFDLENBQUM7b0JBRUYsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUM7WUFFaEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDdkUsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssUUFBUSxFQUFFO2dCQUNsQyxPQUFPLFVBQVUsQ0FBQzthQUNyQjtZQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFO2dCQUN0QixJQUFJLFlBQVksQ0FBQyxPQUFPLEtBQUssU0FBUyxJQUFJLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ25GLE9BQU8sdUJBQXVCLENBQUM7aUJBQ2xDO2dCQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHNEQUFzRCxvQkFBVSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxpQkFBTyxDQUFDLFlBQVksQ0FBQyxPQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRWxMLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDbEM7WUFFRCxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFFM0IsTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDM0M7WUFFRCxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBRWhFLElBQUksTUFBTSxFQUFFO2dCQUNSLE1BQU0sTUFBTSxDQUFDO2FBQ2hCO1lBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNwQyxDQUFDO1FBRU0saUJBQWlCLENBQUMsVUFBc0I7WUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0RCxJQUFJLGFBQWEsRUFBRTtnQkFDZixNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0I7UUFDTCxDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFzQjtZQUM5QyxPQUFPLElBQUksT0FBTyxDQUFVLE9BQU8sQ0FBQyxFQUFFO2dCQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDdEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25CLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFVCxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUM5QixPQUFPLEVBQUUsT0FBTztvQkFDaEIsaUJBQWlCLEVBQUUsVUFBVTtpQkFDaEMsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUVKO0lBekZELDBDQXlGQyJ9