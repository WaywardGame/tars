define(["require", "exports", "game/entity/action/IAction", "../../../IContext", "../../../IObjective", "../../../Objective", "../../../utilities/Item", "../../acquire/item/AcquireItemForAction", "../../contextData/SetContextData", "../../core/ExecuteAction", "../../core/Lambda"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, Item_1, AcquireItemForAction_1, SetContextData_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReinforceItem extends Objective_1.default {
        constructor(item, options = {}) {
            super();
            this.item = item;
            this.options = options;
        }
        getIdentifier() {
            return `ReinforceItem:${this.item}:${this.options.targetDurabilityMultipler}:${this.options.minWorth}`;
        }
        getStatus() {
            return `Reinforcing ${this.item.getName()}`;
        }
        async execute(context) {
            var _a;
            if (!this.item.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const minDur = this.item.minDur;
            const maxDur = this.item.maxDur;
            if (minDur === undefined || maxDur === undefined) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.options.minWorth !== undefined) {
                const worth = (_a = this.item.description()) === null || _a === void 0 ? void 0 : _a.worth;
                if (worth === undefined || worth < this.options.minWorth) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            if (this.options.targetDurabilityMultipler !== undefined) {
                const defaultDurability = itemManager.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
                if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);
            const objectives = [];
            const reinforceItems = Item_1.itemUtilities.getInventoryItemsWithUse(context, IAction_1.ActionType.Reinforce);
            if (reinforceItems.length === 0) {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Reinforce));
            }
            else {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, reinforceItems[0]));
            }
            objectives.push(new Lambda_1.default(async (context) => {
                const reinforceItem = context.getData(IContext_1.ContextDataType.LastAcquiredItem);
                if (!reinforceItem) {
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return (new ExecuteAction_1.default(IAction_1.ActionType.Reinforce, (context, action) => {
                    action.execute(context.player, reinforceItem, this.item);
                }).setStatus(this));
            }));
            return objectives;
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vUmVpbmZvcmNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsVUFBNkUsRUFBRTtZQUN4SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXdFO1FBRXpJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDakQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLDBDQUFFLEtBQUssQ0FBQztnQkFDN0MsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFDekQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3pELE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ25ILElBQUksTUFBTSxHQUFHLGlCQUFpQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQUU7b0JBQ3pFLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7aUJBQzlCO2FBQ0Q7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsTUFBTSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFM0UsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLGNBQWMsR0FBRyxvQkFBYSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdGLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFFaEU7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pGO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO2dCQUMxQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDeEUsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7Z0JBRUQsT0FBTyxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDbkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUFqRUQsZ0NBaUVDIn0=