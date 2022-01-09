define(["require", "exports", "game/entity/action/IAction", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UnequipItem extends Objective_1.default {
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
            var _a;
            const item = (_a = this.item) !== null && _a !== void 0 ? _a : this.getAcquiredItem(context);
            if (!item) {
                this.log.error("Invalid unequip item");
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (!item.isEquipped()) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return new ExecuteAction_1.default(IAction_1.ActionType.Unequip, (context, action) => {
                action.execute(context.player, item);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this);
        }
    }
    exports.default = UnequipItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5lcXVpcEl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL1VuZXF1aXBJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVNBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixJQUFXO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFNBQUksR0FBSixJQUFJLENBQU87UUFFeEMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxXQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDO1FBRU0sU0FBUzs7WUFDZixPQUFPLGVBQWUsTUFBQSxJQUFJLENBQUMsSUFBSSwwQ0FBRSxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQzlDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxNQUFNLElBQUksR0FBRyxNQUFBLElBQUksQ0FBQyxJQUFJLG1DQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN2QyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtnQkFDdkIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE9BQU8sSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNoRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7S0FFRDtJQS9CRCw4QkErQkMifQ==