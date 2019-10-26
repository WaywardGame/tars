define(["require", "exports", "entity/action/ActionExecutor"], function (require, exports, ActionExecutor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pendingActions = {};
    async function waitForAction(actionType) {
        return new Promise(resolve => {
            const rejectorId = setTimeout(() => {
                delete pendingActions[actionType];
                resolve(false);
            }, 1000);
            pendingActions[actionType] = {
                resolve: resolve,
                rejectorTimeoutId: rejectorId,
            };
        });
    }
    exports.waitForAction = waitForAction;
    function postExecuteAction(actionType) {
        const pendingAction = pendingActions[actionType];
        if (pendingAction) {
            clearTimeout(pendingAction.rejectorTimeoutId);
            delete pendingActions[actionType];
            pendingAction.resolve(true);
        }
    }
    exports.postExecuteAction = postExecuteAction;
    async function executeAction(context, actionType, executor) {
        let waiter;
        if (context.player.hasDelay()) {
            await new Promise(resolve => {
                const checker = () => {
                    if (!context.player.hasDelay()) {
                        resolve();
                        return;
                    }
                    setTimeout(checker, 10);
                };
                checker();
            });
        }
        if (multiplayer.isConnected()) {
            waiter = waitForAction(actionType);
        }
        executor(context, ActionExecutor_1.default.get(actionType).skipConfirmation());
        if (waiter) {
            await waiter;
        }
    }
    exports.executeAction = executeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBTUEsTUFBTSxjQUFjLEdBS2hCLEVBQUUsQ0FBQztJQUVBLEtBQUssVUFBVSxhQUFhLENBQUMsVUFBc0I7UUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBVSxPQUFPLENBQUMsRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNsQyxPQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVULGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRztnQkFDNUIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLGlCQUFpQixFQUFFLFVBQVU7YUFDN0IsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVpELHNDQVlDO0lBRUQsU0FBZ0IsaUJBQWlCLENBQUMsVUFBc0I7UUFDdkQsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELElBQUksYUFBYSxFQUFFO1lBQ2xCLFlBQVksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM5QyxPQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVCO0lBQ0YsQ0FBQztJQVBELDhDQU9DO0lBRU0sS0FBSyxVQUFVLGFBQWEsQ0FDbEMsT0FBZ0IsRUFDaEIsVUFBYSxFQUNiLFFBQW9LO1FBQ3BLLElBQUksTUFBb0MsQ0FBQztRQUV6QyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDOUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0IsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO29CQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRTt3QkFDL0IsT0FBTyxFQUFFLENBQUM7d0JBQ1YsT0FBTztxQkFDUDtvQkFFRCxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QixDQUFDLENBQUM7Z0JBRUYsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLENBQUMsQ0FBQztTQUNIO1FBRUQsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFFOUIsTUFBTSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNuQztRQUVELFFBQVEsQ0FBQyxPQUFPLEVBQUUsd0JBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsZ0JBQWdCLEVBQVMsQ0FBQyxDQUFDO1FBRTVFLElBQUksTUFBTSxFQUFFO1lBQ1gsTUFBTSxNQUFNLENBQUM7U0FDYjtJQUNGLENBQUM7SUEvQkQsc0NBK0JDIn0=