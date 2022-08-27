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
            this.includeUniqueIdentifierInHashCode = true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixhQUE4QyxTQUFRLG1CQUFTO1FBSW5GLFlBQ2tCLE1BQVMsRUFDVCxJQUEyQixFQUMzQixnQkFBK0IsRUFDL0IsdUJBQXlDO1lBQzFELEtBQUssRUFBRSxDQUFDO1lBSlMsV0FBTSxHQUFOLE1BQU0sQ0FBRztZQUNULFNBQUksR0FBSixJQUFJLENBQXVCO1lBQzNCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBZTtZQUMvQiw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQWtCO1lBTnhDLHNDQUFpQyxHQUFHLElBQUksQ0FBQztRQVE1RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixvQkFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSyxDQUFDLEVBQUUsQ0FBQztRQUN6RCxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQywwQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDcEksQ0FBQztRQUVlLFNBQVM7WUFDeEIsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3JJLENBQUM7UUFFa0IsaUJBQWlCLENBQUMsT0FBZ0I7WUFDcEQsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUFuQ0QsZ0NBbUNDIn0=