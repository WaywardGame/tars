define(["require", "exports", "game/entity/action/IAction", "language/Dictionaries", "language/Translation", "../../Objective", "../../utilities/Action"], function (require, exports, IAction_1, Dictionaries_1, Translation_1, Objective_1, Action_1) {
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
            return `Executing ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Action, this.actionType).inContext(Translation_1.TextContext.Lowercase).getString()} action`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixhQUFvQyxTQUFRLG1CQUFTO1FBRXpFLFlBQ2tCLFVBQWEsRUFDYixRQUErTDtZQUNoTixLQUFLLEVBQUUsQ0FBQztZQUZTLGVBQVUsR0FBVixVQUFVLENBQUc7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUF1TDtRQUVqTixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQ2xJLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE9BQU8sd0JBQWUsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQWUsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxPQUFnQjtZQUMzQyxPQUFPLENBQUMsQ0FBQztRQUNWLENBQUM7S0FDRDtJQS9CRCxnQ0ErQkMifQ==