define(["require", "exports", "game/entity/action/IAction", "../../../IContext", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EquipItem extends Objective_1.default {
        constructor(equip, item) {
            super();
            this.equip = equip;
            this.item = item;
        }
        getIdentifier() {
            return `EquipItem:${this.item}`;
        }
        getStatus() {
            var _a;
            return `Equipping ${(_a = this.item) === null || _a === void 0 ? void 0 : _a.getName()}`;
        }
        async execute(context) {
            const item = this.item || context.getData(IContext_1.ContextDataType.LastAcquiredItem);
            if (!item) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (item.isEquipped()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Equip, (context, action) => {
                action.execute(context.player, item, this.equip);
            });
        }
    }
    exports.default = EquipItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXF1aXBJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvaXRlbS9FcXVpcEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsU0FBVSxTQUFRLG1CQUFTO1FBRS9DLFlBQTZCLEtBQWdCLEVBQW1CLElBQVc7WUFDMUUsS0FBSyxFQUFFLENBQUM7WUFEb0IsVUFBSyxHQUFMLEtBQUssQ0FBVztZQUFtQixTQUFJLEdBQUosSUFBSSxDQUFPO1FBRTNFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sYUFBYSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLFNBQVM7O1lBQ2YsT0FBTyxhQUFhLE1BQUEsSUFBSSxDQUFDLElBQUksMENBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1YsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUN0QixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsT0FBTyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzlELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUVEO0lBN0JELDRCQTZCQyJ9