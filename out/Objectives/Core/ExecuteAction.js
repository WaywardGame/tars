define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/ITranslation", "language/Translation", "../../core/objective/Objective", "../../utilities/Action"], function (require, exports, IAction_1, Dictionary_1, ITranslation_1, Translation_1, Objective_1, Action_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExecuteAction extends Objective_1.default {
        constructor(actionType, executor) {
            super();
            this.actionType = actionType;
            this.executor = executor;
        }
        getIdentifier() {
            return `ExecuteAction:${IAction_1.ActionType[this.actionType]}`;
        }
        getStatus() {
            return `Executing ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.actionType).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            return Action_1.actionUtilities.executeAction(context, this.actionType, this.executor);
        }
        getBaseDifficulty(context) {
            return 1;
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixhQUFvQyxTQUFRLG1CQUFTO1FBRXpFLFlBQ2tCLFVBQWEsRUFDYixRQUErTDtZQUNoTixLQUFLLEVBQUUsQ0FBQztZQUZTLGVBQVUsR0FBVixVQUFVLENBQUc7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUF1TDtRQUVqTixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsMEJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQ2xJLENBQUM7UUFFZSxTQUFTO1lBQ3hCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxPQUFPLHdCQUFlLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFlLENBQUMsQ0FBQztRQUN0RixDQUFDO1FBRWtCLGlCQUFpQixDQUFDLE9BQWdCO1lBQ3BELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztLQUNEO0lBL0JELGdDQStCQyJ9