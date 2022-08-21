define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/ITranslation", "language/Translation", "../../core/objective/Objective"], function (require, exports, IAction_1, Dictionary_1, ITranslation_1, Translation_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExecuteAction extends Objective_1.default {
        constructor(action, args, expectedMessages, expectedCannotUseResult) {
            super();
            this.action = action;
            this.args = args;
            this.expectedMessages = expectedMessages;
            this.expectedCannotUseResult = expectedCannotUseResult;
        }
        getIdentifier() {
            return `ExecuteAction:${IAction_1.ActionType[this.action.type]}`;
        }
        getStatus() {
            return `Executing ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.action.type).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            return context.utilities.action.executeAction(context, this.action, this.args, this.expectedMessages, this.expectedCannotUseResult);
        }
        getBaseDifficulty(context) {
            return 1;
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixhQUE4QyxTQUFRLG1CQUFTO1FBRW5GLFlBQ2tCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsdUJBQXlDO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBSlMsV0FBTSxHQUFOLE1BQU0sQ0FBRztZQUNULFNBQUksR0FBSixJQUFJLENBQXVCO1lBQzNCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBZTtZQUMvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWtCO1FBRTNELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLG9CQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3pELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDLENBQUMsU0FBUyxDQUFDLDBCQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQztRQUNwSSxDQUFDO1FBRWUsU0FBUztZQUN4QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDckksQ0FBQztRQUVrQixpQkFBaUIsQ0FBQyxPQUFnQjtZQUNwRCxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQWpDRCxnQ0FpQ0MifQ==