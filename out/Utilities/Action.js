define(["require", "exports", "game/entity/action/ActionExecutor", "game/entity/action/Actions", "../core/objective/IObjective"], function (require, exports, ActionExecutor_1, Actions_1, IObjective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionUtilities = void 0;
    class ActionUtilities {
        constructor() {
            this.pendingActions = {};
        }
        async executeAction(context, actionType, executor) {
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
            if (multiplayer.isConnected()) {
                waiter = this.waitForAction(actionType);
            }
            const objectiveResult = executor(context, ActionExecutor_1.default.get(Actions_1.default[actionType]).skipConfirmation());
            if (waiter) {
                await waiter;
            }
            return objectiveResult;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLE1BQWEsZUFBZTtRQUE1QjtZQUVZLG1CQUFjLEdBR2pCLEVBQUUsQ0FBQztRQWdFWixDQUFDO1FBOURVLEtBQUssQ0FBQyxhQUFhLENBQ3RCLE9BQWdCLEVBQ2hCLFVBQWEsRUFDYixRQUE2TDtZQUM3TCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxNQUFvQyxDQUFDO1lBRXpDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDMUIsTUFBTSxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtvQkFDOUIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO3dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRTs0QkFDM0IsT0FBTyxFQUFFLENBQUM7NEJBQ1YsT0FBTzt5QkFDVjt3QkFFRCxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUMzQixDQUFDLENBQUM7b0JBRUYsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7YUFDTjtZQUVELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUUzQixNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMzQztZQUVELE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsd0JBQWMsQ0FBQyxHQUFHLENBQUMsaUJBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBUyxDQUFDLENBQUM7WUFFeEgsSUFBSSxNQUFNLEVBQUU7Z0JBQ1IsTUFBTSxNQUFNLENBQUM7YUFDaEI7WUFFRCxPQUFPLGVBQWUsQ0FBQztRQUMzQixDQUFDO1FBRU0saUJBQWlCLENBQUMsVUFBc0I7WUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0RCxJQUFJLGFBQWEsRUFBRTtnQkFDZixNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0I7UUFDTCxDQUFDO1FBRU8sS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFzQjtZQUM5QyxPQUFPLElBQUksT0FBTyxDQUFVLE9BQU8sQ0FBQyxFQUFFO2dCQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDdEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ25CLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFVCxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUM5QixPQUFPLEVBQUUsT0FBTztvQkFDaEIsaUJBQWlCLEVBQUUsVUFBVTtpQkFDaEMsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUVKO0lBckVELDBDQXFFQyJ9