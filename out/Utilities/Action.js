define(["require", "exports", "game/entity/action/ActionExecutor", "game/entity/action/Actions"], function (require, exports, ActionExecutor_1, Actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.actionUtilities = void 0;
    class ActionUtilities {
        constructor() {
            this.pendingActions = {};
        }
        async executeAction(context, actionType, executor) {
            let waiter;
            if (context.player.hasDelay()) {
                await new Promise(resolve => {
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
                clearTimeout(pendingAction.rejectorTimeoutId);
                delete this.pendingActions[actionType];
                pendingAction.resolve(true);
            }
        }
        async waitForAction(actionType) {
            return new Promise(resolve => {
                const rejectorId = setTimeout(() => {
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
    exports.actionUtilities = new ActionUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLE1BQU0sZUFBZTtRQUFyQjtZQUVTLG1CQUFjLEdBS2xCLEVBQUUsQ0FBQztRQTREUixDQUFDO1FBMURPLEtBQUssQ0FBQyxhQUFhLENBQ3pCLE9BQWdCLEVBQ2hCLFVBQWEsRUFDYixRQUE2TDtZQUM3TCxJQUFJLE1BQW9DLENBQUM7WUFFekMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM5QixNQUFNLElBQUksT0FBTyxDQUFPLE9BQU8sQ0FBQyxFQUFFO29CQUNqQyxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7d0JBQ3BCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFOzRCQUMvQixPQUFPLEVBQUUsQ0FBQzs0QkFDVixPQUFPO3lCQUNQO3dCQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3hCLENBQUMsQ0FBQztvQkFFRixPQUFPLEVBQUUsQ0FBQztnQkFDWCxDQUFDLENBQUMsQ0FBQzthQUNIO1lBRUQsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBRTlCLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxpQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFTLENBQUMsQ0FBQztZQUV4SCxJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLE1BQU0sQ0FBQzthQUNiO1lBRUQsT0FBTyxlQUFlLENBQUM7UUFDeEIsQ0FBQztRQUVNLGlCQUFpQixDQUFDLFVBQXNCO1lBQzlDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdEQsSUFBSSxhQUFhLEVBQUU7Z0JBQ2xCLFlBQVksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDOUMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN2QyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBc0I7WUFDakQsT0FBTyxJQUFJLE9BQU8sQ0FBVSxPQUFPLENBQUMsRUFBRTtnQkFDckMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDbEMsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN2QyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFVCxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUNqQyxPQUFPLEVBQUUsT0FBTztvQkFDaEIsaUJBQWlCLEVBQUUsVUFBVTtpQkFDN0IsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUVEO0lBRVksUUFBQSxlQUFlLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9