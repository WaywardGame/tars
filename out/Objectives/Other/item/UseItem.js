define(["require", "exports", "game/entity/action/IAction", "language/Dictionary", "language/ITranslation", "language/Translation", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction"], function (require, exports, IAction_1, Dictionary_1, ITranslation_1, Translation_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseItem extends Objective_1.default {
        constructor(actionType, item) {
            super();
            this.actionType = actionType;
            this.item = item;
        }
        getIdentifier() {
            return `UseItem:${this.item}:${IAction_1.ActionType[this.actionType]}`;
        }
        getStatus() {
            var _a;
            return `Using ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()} for ${Translation_1.default.nameOf(Dictionary_1.default.Action, this.actionType).inContext(ITranslation_1.TextContext.Lowercase).getString()} action`;
        }
        async execute(context) {
            var _a;
            const item = (_a = this.item) !== null && _a !== void 0 ? _a : context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item || !item.isValid()) {
                this.log.warn(`Invalid use item for action ${IAction_1.ActionType[this.actionType]}`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || !description.use.includes(this.actionType)) {
                this.log.warn(`Invalid use item for action ${IAction_1.ActionType[this.actionType]}. Item ${item} is missing that action type`);
                return IObjective_1.ObjectiveResult.Restart;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, (context, action) => {
                if (!item.isNearby(context.player, true)) {
                    this.log.warn(`Invalid use item for action ${IAction_1.ActionType[this.actionType]}. Item ${item} is not nearby`, this.getStatus());
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(context.player, item, this.actionType);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this);
        }
    }
    exports.default = UseItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vVXNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsVUFBc0IsRUFBbUIsSUFBVztZQUNoRixLQUFLLEVBQUUsQ0FBQztZQURvQixlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQW1CLFNBQUksR0FBSixJQUFJLENBQU87UUFFakYsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxXQUFXLElBQUksQ0FBQyxJQUFJLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztRQUM5RCxDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLFNBQVMsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsUUFBUSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLDBCQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQztRQUMxSixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsTUFBTSxJQUFJLEdBQUcsTUFBQSxJQUFJLENBQUMsSUFBSSxtQ0FBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0Isb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RSxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNuRixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0Isb0JBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsSUFBSSw4QkFBOEIsQ0FBQyxDQUFDO2dCQUN0SCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLCtCQUErQixvQkFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLGdCQUFnQixFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO29CQUMxSCxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFdEQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsQ0FBQztLQUVEO0lBdkNELDBCQXVDQyJ9