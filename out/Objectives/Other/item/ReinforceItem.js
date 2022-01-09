define(["require", "exports", "game/entity/action/IAction", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItemForAction", "../../contextData/SetContextData", "../../core/ExecuteAction"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, AcquireItemForAction_1, SetContextData_1, ExecuteAction_1) {
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
                const defaultDurability = context.island.items.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
                if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);
            const objectives = [];
            const reinforceItems = context.utilities.item.getInventoryItemsWithUse(context, IAction_1.ActionType.Reinforce);
            if (reinforceItems.length > 0) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, reinforceItems[0]));
            }
            else {
                objectives.push(new AcquireItemForAction_1.default(IAction_1.ActionType.Reinforce).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Reinforce, (context, action) => {
                const reinforceItem = context.getData(IContext_1.ContextDataType.Item1);
                if (!reinforceItem) {
                    this.log.error("Invalid reinforce item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(context.player, reinforceItem, this.item);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2l0ZW0vUmVpbmZvcmNlSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFpQkEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsVUFBNEUsRUFBRTtZQUN2SSxLQUFLLEVBQUUsQ0FBQztZQURvQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQXVFO1FBRXhJLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3hHLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjs7WUFDcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDL0I7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDakQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO2dCQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLDBDQUFFLEtBQUssQ0FBQztnQkFDN0MsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtvQkFDekQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3pELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUgsSUFBSSxNQUFNLEdBQUcsaUJBQWlCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtvQkFDekUsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7YUFDRDtZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxNQUFNLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztZQUUzRSxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RHLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFFOUU7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsaUJBQWlCLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3pHO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQzNFLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0QsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDekMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7Z0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDakMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEIsT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBakVELGdDQWlFQyJ9