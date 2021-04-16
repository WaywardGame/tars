define(["require", "exports", "game/entity/action/IAction", "../../IContext", "../../IObjective", "../../Objective", "../Core/ExecuteAction"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Unequip extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `Unequip:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Unequipping ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (!item.isEquipped()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Unequip, (context, action) => {
                action.execute(context.player, item);
            });
        }
    }
    exports.default = Unequip;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5lcXVpcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1VuZXF1aXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLElBQVc7WUFDdkMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTztRQUV4QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQy9CLENBQUM7UUFFTSxTQUFTOztZQUNmLE9BQU8sZUFBZSxNQUFBLElBQUksQ0FBQyxJQUFJLDBDQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNWLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUN2QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ2hFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FFRDtJQTdCRCwwQkE2QkMifQ==