var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const pendingActions = {};
    function waitForAction(actionType) {
        return new Promise(resolve => {
            const rejectorId = setTimeout(() => {
                delete pendingActions[actionType];
                resolve(false);
            }, 1000);
            pendingActions[actionType] = {
                resolve: resolve,
                rejectorTimeoutId: rejectorId
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
    function executeAction(actionType, executeArgument) {
        return __awaiter(this, void 0, void 0, function* () {
            let waiter;
            if (localPlayer.hasDelay()) {
                yield new Promise(resolve => {
                    const checker = () => {
                        if (!localPlayer.hasDelay()) {
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
            actionManager.execute(localPlayer, actionType, executeArgument);
            if (waiter) {
                yield waiter;
            }
        });
    }
    exports.executeAction = executeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFHQSxNQUFNLGNBQWMsR0FLaEIsRUFBRSxDQUFDO0lBRVAsU0FBZ0IsYUFBYSxDQUFDLFVBQXNCO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQVUsT0FBTyxDQUFDLEVBQUU7WUFDckMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbEMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixpQkFBaUIsRUFBRSxVQUFVO2FBQzdCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFaRCxzQ0FZQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFVBQXNCO1FBQ3ZELE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxJQUFJLGFBQWEsRUFBRTtZQUNsQixZQUFZLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM1QjtJQUNGLENBQUM7SUFQRCw4Q0FPQztJQUVELFNBQXNCLGFBQWEsQ0FBQyxVQUFzQixFQUFFLGVBQWlDOztZQUM1RixJQUFJLE1BQW9DLENBQUM7WUFFekMsSUFBSSxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzNCLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQzNCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTt3QkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRTs0QkFDNUIsT0FBTyxFQUFFLENBQUM7NEJBQ1YsT0FBTzt5QkFDUDt3QkFFRCxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUN6QixDQUFDLENBQUM7b0JBRUYsT0FBTyxFQUFFLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUU5QixNQUFNLEdBQUcsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBRWhFLElBQUksTUFBTSxFQUFFO2dCQUNYLE1BQU0sTUFBTSxDQUFDO2FBQ2I7UUFDRixDQUFDO0tBQUE7SUE1QkQsc0NBNEJDIn0=