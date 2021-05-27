define(["require", "exports", "game/entity/action/IAction", "language/Dictionaries", "language/Translation", "../../IContext", "../../IObjective", "../../Objective", "../Core/ExecuteAction"], function (require, exports, IAction_1, Dictionaries_1, Translation_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1) {
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
            return `Using ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()} for ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Action, this.actionType).inContext(Translation_1.TextContext.Lowercase).getString()} action`;
        }
        async execute(context) {
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const description = item.description();
            if (!description || !description.use || !description.use.includes(this.actionType)) {
                this.log.error("Invalid use item", item, this.actionType);
                return IObjective_1.ObjectiveResult.Restart;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.UseItem, (context, action) => {
                action.execute(context.player, item, this.actionType);
            }).setStatus(this);
        }
    }
    exports.default = UseItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1VzZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLFVBQXNCLEVBQW1CLElBQVc7WUFDaEYsS0FBSyxFQUFFLENBQUM7WUFEb0IsZUFBVSxHQUFWLFVBQVUsQ0FBWTtZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRWpGLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sV0FBVyxJQUFJLENBQUMsSUFBSSxJQUFJLG9CQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDOUQsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyxTQUFTLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLFFBQVEscUJBQVcsQ0FBQyxNQUFNLENBQUMseUJBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDMUosQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ25GLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzFELE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxPQUFPLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDaEUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7S0FFRDtJQS9CRCwwQkErQkMifQ==