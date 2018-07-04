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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1V0aWxpdGllcy9BY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFHQSxNQUFNLGNBQWMsR0FLaEIsRUFBRSxDQUFDO0lBRVAsdUJBQThCLFVBQXNCO1FBQ25ELE9BQU8sSUFBSSxPQUFPLENBQVUsT0FBTyxDQUFDLEVBQUU7WUFDckMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDbEMsT0FBTyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFVCxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUc7Z0JBQzVCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixpQkFBaUIsRUFBRSxVQUFVO2FBQzdCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFaRCxzQ0FZQztJQUVELDJCQUFrQyxVQUFzQjtRQUN2RCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsSUFBSSxhQUFhLEVBQUU7WUFDbEIsWUFBWSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlDLE9BQU8sY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUI7SUFDRixDQUFDO0lBUEQsOENBT0M7SUFFRCx1QkFBb0MsVUFBc0IsRUFBRSxlQUFpQzs7WUFDNUYsSUFBSSxNQUFvQyxDQUFDO1lBRXpDLElBQUksV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUMzQixNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUMzQixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7d0JBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUU7NEJBQzVCLE9BQU8sRUFBRSxDQUFDOzRCQUNWLE9BQU87eUJBQ1A7d0JBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUFDO29CQUVGLE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFFOUIsTUFBTSxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNuQztZQUVELGFBQWEsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUVoRSxJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLE1BQU0sQ0FBQzthQUNiO1FBQ0YsQ0FBQztLQUFBO0lBNUJELHNDQTRCQyJ9