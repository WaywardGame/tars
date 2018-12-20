var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "action/IAction", "../IObjective", "../Objective", "../Utilities/Action"], function (require, exports, IAction_1, IObjective_1, Objective_1, Action_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExecuteAction extends Objective_1.default {
        constructor(actionType, executor, complete = true) {
            super();
            this.actionType = actionType;
            this.executor = executor;
            this.complete = complete;
        }
        getHashCode() {
            return `ExecuteAction:${IAction_1.ActionType[this.actionType]}`;
        }
        onExecute(base, inventory, calculateDifficulty) {
            return __awaiter(this, void 0, void 0, function* () {
                if (calculateDifficulty) {
                    return 0;
                }
                yield Action_1.executeAction(this.actionType, this.executor);
                if (this.complete) {
                    return IObjective_1.ObjectiveStatus.Complete;
                }
            });
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9PYmplY3RpdmVzL0V4ZWN1dGVBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFRQSxNQUFxQixhQUFvQyxTQUFRLG1CQUFTO1FBRXpFLFlBQTZCLFVBQWEsRUFBbUIsUUFBb0osRUFBbUIsV0FBb0IsSUFBSTtZQUMzUCxLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFHO1lBQW1CLGFBQVEsR0FBUixRQUFRLENBQTRJO1lBQW1CLGFBQVEsR0FBUixRQUFRLENBQWdCO1FBRTVQLENBQUM7UUFFTSxXQUFXO1lBQ2pCLE9BQU8saUJBQWlCLG9CQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDdkQsQ0FBQztRQUVZLFNBQVMsQ0FBQyxJQUFXLEVBQUUsU0FBMEIsRUFBRSxtQkFBNEI7O2dCQUMzRixJQUFJLG1CQUFtQixFQUFFO29CQUN4QixPQUFPLENBQUMsQ0FBQztpQkFDVDtnQkFFRCxNQUFNLHNCQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBZSxDQUFDLENBQUM7Z0JBRTNELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDbEIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztpQkFDaEM7WUFDRixDQUFDO1NBQUE7S0FFRDtJQXRCRCxnQ0FzQkMifQ==