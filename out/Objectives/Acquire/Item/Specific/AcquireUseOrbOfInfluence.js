define(["require", "exports", "game/item/IItem", "game/entity/IStats", "game/entity/action/actions/RubCounterClockwise", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../AcquireItem", "../../../contextData/SetContextData", "../../../core/ExecuteAction", "../../../core/ReserveItems"], function (require, exports, IItem_1, IStats_1, RubCounterClockwise_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, ReserveItems_1) {
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
            const malign = context.human.stat.get(IStats_1.Stat.Malignity);
            if (malign.value < 5000) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const itemContextDataKey = this.getUniqueContextDataKey("OrbOfInfluence");
            const objectives = [];
            const orbOfInfluenceItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.OrbOfInfluence);
            if (orbOfInfluenceItem) {
                objectives.push(new ReserveItems_1.default(orbOfInfluenceItem));
                objectives.push(new SetContextData_1.default(itemContextDataKey, orbOfInfluenceItem));
            }
            else {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.OrbOfInfluence).passAcquireData(this).setContextDataKey(itemContextDataKey));
            }
            objectives.push(new ExecuteAction_1.default(RubCounterClockwise_1.default, (context) => {
                const item = context.getData(itemContextDataKey);
                if (!item?.isValid()) {
                    this.log.error("Invalid orb of influence");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [item];
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = AcquireUseOrbOfInfluence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVVzZU9yYk9mSW5mbHVlbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVVc2VPcmJPZkluZmx1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUEvRDs7WUFFaUIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDO1FBMEMzQyxDQUFDO1FBeENPLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsQ0FBQztRQUNuQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8seUNBQXlDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQztZQUN2RCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFO2dCQUN4QixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUUxRSxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdkcsSUFBSSxrQkFBa0IsRUFBRTtnQkFDdkIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7YUFFNUU7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQ3RIO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsNkJBQW1CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxFQUFFO29CQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUMzQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFFRCxPQUFPLENBQUMsSUFBSSxDQUFnRCxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQTVDRCwyQ0E0Q0MifQ==