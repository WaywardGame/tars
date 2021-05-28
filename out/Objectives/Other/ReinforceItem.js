define(["require", "exports", "game/entity/action/IAction", "../../IContext", "../../IObjective", "../../Objective", "../acquire/item/AcquireItemForAction", "../core/ExecuteAction", "../core/Lambda"], function (require, exports, IAction_1, IContext_1, IObjective_1, Objective_1, AcquireItemForAction_1, ExecuteAction_1, Lambda_1) {
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
        getStatus() {
            return `Reinforcing ${this.item.getName()}`;
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
                    const reinforcer = context.getData(IContext_1.ContextDataType.LastAcquiredItem);
                    if (!reinforcer) {
                        return IObjective_1.ObjectiveResult.Restart;
                    }
                    return (new ExecuteAction_1.default(IAction_1.ActionType.Reinforce, (context, action) => {
                        action.execute(context.player, reinforcer, this.item);
                    }).setStatus(this));
                }),
            ];
        }
    }
    exports.default = ReinforceItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbmZvcmNlSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL1JlaW5mb3JjZUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsYUFBYyxTQUFRLG1CQUFTO1FBRW5ELFlBQTZCLElBQVUsRUFBbUIsU0FBa0I7WUFDM0UsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUFtQixjQUFTLEdBQVQsU0FBUyxDQUFTO1FBRTVFLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8saUJBQWlCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztRQUM3QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzthQUMvQjtZQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ2hDLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUNqRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtnQkFDakMsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbkgsSUFBSSxNQUFNLEdBQUcsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDaEQsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQztpQkFDOUI7YUFDRDtZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxNQUFNLElBQUksTUFBTSxFQUFFLENBQUMsQ0FBQztZQUUzRSxPQUFPO2dCQUNOLElBQUksOEJBQW9CLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUM7Z0JBQzlDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7b0JBQzFCLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNyRSxJQUFJLENBQUMsVUFBVSxFQUFFO3dCQUNoQixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO3FCQUMvQjtvQkFFRCxPQUFPLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO3dCQUNuRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQzthQUNGLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUFqREQsZ0NBaURDIn0=