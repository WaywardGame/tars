define(["require", "exports", "entity/action/IAction", "../../Context", "../../IObjective", "../../Objective", "../Acquire/Item/AcquireItemForAction", "../Core/ExecuteAction", "../Core/Lambda"], function (require, exports, IAction_1, Context_1, IObjective_1, Objective_1, AcquireItemForAction_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReinforceItem extends Objective_1.default {
        constructor(item, threshold) {
            super();
            this.item = item;
            this.threshold = threshold;
        }
        getIdentifier() {
            return `ReinforceItem:${this.item}:${this.threshold}`;
        }
        async execute(context) {
            if (!this.item.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            const minDur = this.item.minDur;
            const maxDur = this.item.maxDur;
            if (minDur === undefined || maxDur === undefined) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            if (this.threshold !== undefined) {
                const defaultDuribility = itemManager.getDefaultDurability(context.player, this.item.weight, this.item.type);
                if (maxDur / defaultDuribility > this.threshold) {
                    return IObjective_1.ObjectiveResult.Ignore;
                }
            }
            this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);
            return [
                new AcquireItemForAction_1.default(IAction_1.ActionType.Reinforce),
                new Lambda_1.default(async (context) => {
                    const reinforcer = context.getData(Context_1.ContextDataType.LastAcquiredItem);
                    if (!reinforcer) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return (new ExecuteAction_1.default(IAction_1.ActionType.Reinforce, (context, action) => {
                        action.execute(context.player, reinforcer, this.item);
                    }));
                }),
            ];
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1JlaW5mb3JjZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsU0FBa0I7WUFDM0UsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUFtQixjQUFTLEdBQVQsU0FBUyxDQUFTO1FBRTVFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN6QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ2pELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUNqQyxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdHLElBQUksTUFBTSxHQUFHLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7b0JBQ2hELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7aUJBQzlCO2FBQ0Q7WUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsTUFBTSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFM0UsT0FBTztnQkFDTixJQUFJLDhCQUFvQixDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDO2dCQUM5QyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO29CQUMxQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLHlCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDckUsSUFBSSxDQUFDLFVBQVUsRUFBRTt3QkFDaEIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztxQkFDL0I7b0JBRUQsT0FBTyxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDbkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3ZELENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDO2FBQ0YsQ0FBQztRQUNILENBQUM7S0FFRDtJQTdDRCxnQ0E2Q0MifQ==