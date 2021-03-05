define(["require", "exports", "game/entity/action/ActionExecutor", "game/entity/action/Actions"], function (require, exports, ActionExecutor_1, Actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.executeAction = exports.postExecuteAction = exports.waitForAction = void 0;
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
        executor(context, ActionExecutor_1.default.get(Actions_1.default[actionType]).skipConfirmation());
        if (waiter) {
            await waiter;
        }
    }
    exports.executeAction = executeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLE1BQU0sY0FBYyxHQUtoQixFQUFFLENBQUM7SUFFQSxLQUFLLFVBQVUsYUFBYSxDQUFDLFVBQXNCO1FBQ3pELE9BQU8sSUFBSSxPQUFPLENBQVUsT0FBTyxDQUFDLEVBQUU7WUFDckMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbEMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixpQkFBaUIsRUFBRSxVQUFVO2FBQzdCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFaRCxzQ0FZQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3ZELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxJQUFJLGFBQWEsRUFBRTtZQUNsQixZQUFZLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtJQUNGLENBQUM7SUFQRCw4Q0FPQztJQUVNLEtBQUssVUFBVSxhQUFhLENBQ2xDLE9BQWdCLEVBQ2hCLFVBQWEsRUFDYixRQUFrTDtRQUNsTCxJQUFJLE1BQW9DLENBQUM7UUFFekMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlCLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUU7Z0JBQ2pDLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtvQkFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7d0JBQy9CLE9BQU8sRUFBRSxDQUFDO3dCQUNWLE9BQU87cUJBQ1A7b0JBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDO2dCQUVGLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7U0FDSDtRQUVELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBRTlCLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkM7UUFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLHdCQUFjLENBQUMsR0FBRyxDQUFDLGlCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQVMsQ0FBQyxDQUFDO1FBRWhHLElBQUksTUFBTSxFQUFFO1lBQ1gsTUFBTSxNQUFNLENBQUM7U0FDYjtJQUNGLENBQUM7SUEvQkQsc0NBK0JDIn0=