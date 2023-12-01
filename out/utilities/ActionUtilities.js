/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/entity/action/IAction", "@wayward/game/language/dictionary/Message", "../core/objective/IObjective"], function (require, exports, IAction_1, Message_1, IObjective_1) {
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
            if (multiplayer.isConnected) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWN0aW9uVXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxpdGllcy9BY3Rpb25VdGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7OztJQVVILE1BQWEsZUFBZTtRQUE1QjtZQUVTLG1CQUFjLEdBR2pCLEVBQUUsQ0FBQztRQThGVCxDQUFDO1FBNUZPLEtBQUssQ0FBQyxhQUFhLENBQ3pCLE9BQWdCLEVBQ2hCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsMEJBQTJDLDRCQUFlLENBQUMsT0FBTztZQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNuQixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2hDLENBQUM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7WUFDaEMsQ0FBQztZQUVELElBQUksTUFBb0MsQ0FBQztZQUV6QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtvQkFDakMsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO3dCQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDOzRCQUMvQixPQUFPLEVBQUUsQ0FBQzs0QkFDVixPQUFPO3dCQUNSLENBQUM7d0JBRUQsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEIsQ0FBQyxDQUFDO29CQUVGLE9BQU8sRUFBRSxDQUFDO2dCQUNYLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sNEJBQWUs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