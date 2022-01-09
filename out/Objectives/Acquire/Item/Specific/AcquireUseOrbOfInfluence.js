define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/entity/IStats", "../../../../core/context/IContext", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../AcquireItem", "../../../contextData/SetContextData", "../../../core/ExecuteAction", "../../../core/Lambda"], function (require, exports, IAction_1, IItem_1, IStats_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireUseOrbOfInfluence extends Objective_1.default {
        constructor() {
            super(...arguments);
            this.ignoreInvalidPlans = true;
        }
        getIdentifier() {
            return "AcquireUseOrbOfInfluence";
        }
        getStatus() {
            return "Acquiring and using an orb of influence";
        }
        async execute(context) {
            const malign = context.player.stat.get(IStats_1.Stat.Malignity);
            if (malign.value < 5000) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            const orbOfInfluenceItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.OrbOfInfluence);
            if (orbOfInfluenceItem) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, orbOfInfluenceItem));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.OrbOfInfluence).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            objectives.push(new Lambda_1.default(async (context) => {
                const item = context.getData(IContext_1.ContextDataType.Item1);
                if (!item) {
                    this.log.error("Invalid orb of influence");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return (new ExecuteAction_1.default(IAction_1.ActionType.RubCounterclockwise, (context, action) => {
                    action.execute(context.player, item);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }));
            return objectives;
        }
    }
    exports.default = AcquireUseOrbOfInfluence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVVzZU9yYk9mSW5mbHVlbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVVc2VPcmJPZkluZmx1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUEvRDs7WUFFaUIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDO1FBMkMzQyxDQUFDO1FBekNPLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsQ0FBQztRQUNuQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8seUNBQXlDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQztZQUN4RCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxnQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3ZHLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsS0FBSyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUUvRTtpQkFBTTtnQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLDBCQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNuRztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtnQkFDMUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzNDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7aUJBQy9CO2dCQUdELE9BQU8sQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosT0FBTyxVQUFVLENBQUM7UUFDbkIsQ0FBQztLQUVEO0lBN0NELDJDQTZDQyJ9