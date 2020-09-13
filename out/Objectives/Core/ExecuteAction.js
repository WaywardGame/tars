define(["require", "exports", "entity/action/IAction", "../../IObjective", "../../Objective", "../../Utilities/Action"], function (require, exports, IAction_1, IObjective_1, Objective_1, Action_1) {
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
        isDynamic() {
            return true;
        }
        async execute(context) {
            if (context.calculatingDifficulty) {
                return 0;
            }
            await Action_1.executeAction(context, this.actionType, this.executor);
            return IObjective_1.ObjectiveResult.Complete;
        }
        getBaseDifficulty(context) {
            return 1;
        }
    }
    exports.default = ExecuteAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXhlY3V0ZUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0NvcmUvRXhlY3V0ZUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFxQixhQUFvQyxTQUFRLG1CQUFTO1FBRXpFLFlBQ2tCLFVBQWEsRUFDYixRQUFzSztZQUN2TCxLQUFLLEVBQUUsQ0FBQztZQUZTLGVBQVUsR0FBVixVQUFVLENBQUc7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUE4SjtRQUV4TCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGlCQUFpQixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE1BQU0sc0JBQWEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBZSxDQUFDLENBQUM7WUFFcEUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZ0I7WUFDM0MsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDO0tBQ0Q7SUE3QkQsZ0NBNkJDIn0=