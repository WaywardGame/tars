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
                const defaultDuribility = itemManager.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL090aGVyL1JlaW5mb3JjZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsU0FBa0I7WUFDM0UsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUFtQixjQUFTLEdBQVQsU0FBUyxDQUFTO1FBRTVFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN6QixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQy9CO1lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDaEMsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ2pELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUNqQyxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNuSCxJQUFJLE1BQU0sR0FBRyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO29CQUNoRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2lCQUM5QjthQUNEO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMseUNBQXlDLE1BQU0sSUFBSSxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBRTNFLE9BQU87Z0JBQ04sSUFBSSw4QkFBb0IsQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQztnQkFDOUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtvQkFDMUIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyx5QkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JFLElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2hCLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7cUJBQy9CO29CQUVELE9BQU8sQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ25FLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN2RCxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNMLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUE3Q0QsZ0NBNkNDIn0=