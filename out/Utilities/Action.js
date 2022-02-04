define(["require", "exports", "game/entity/action/ActionExecutor", "game/entity/action/Actions"], function (require, exports, ActionExecutor_1, Actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionUtilities = void 0;
    class ActionUtilities {
        constructor() {
            this.pendingActions = {};
        }
        async executeAction(context, actionType, executor) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLE1BQWEsZUFBZTtRQUE1QjtZQUVZLG1CQUFjLEdBR2pCLEVBQUUsQ0FBQztRQTREWixDQUFDO1FBMURVLEtBQUssQ0FBQyxhQUFhLENBQ3RCLE9BQWdCLEVBQ2hCLFVBQWEsRUFDYixRQUE2TDtZQUM3TCxJQUFJLE1BQW9DLENBQUM7WUFFekMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUMxQixNQUFNLElBQUksT0FBTyxDQUFPLE9BQU8sQ0FBQyxFQUFFO29CQUM5QixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7d0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFOzRCQUMzQixPQUFPLEVBQUUsQ0FBQzs0QkFDVixPQUFPO3lCQUNWO3dCQUVELFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzNCLENBQUMsQ0FBQztvQkFFRixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQzthQUNOO1lBRUQsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBRTNCLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzNDO1lBRUQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxpQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFTLENBQUMsQ0FBQztZQUV4SCxJQUFJLE1BQU0sRUFBRTtnQkFDUixNQUFNLE1BQU0sQ0FBQzthQUNoQjtZQUVELE9BQU8sZUFBZSxDQUFDO1FBQzNCLENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxVQUFzQjtZQUMzQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RELElBQUksYUFBYSxFQUFFO2dCQUNmLE1BQU0sQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3JELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdkMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtRQUNMLENBQUM7UUFFTyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQXNCO1lBQzlDLE9BQU8sSUFBSSxPQUFPLENBQVUsT0FBTyxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUN0QyxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ3ZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVULElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUc7b0JBQzlCLE9BQU8sRUFBRSxPQUFPO29CQUNoQixpQkFBaUIsRUFBRSxVQUFVO2lCQUNoQyxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBRUo7SUFqRUQsMENBaUVDIn0=