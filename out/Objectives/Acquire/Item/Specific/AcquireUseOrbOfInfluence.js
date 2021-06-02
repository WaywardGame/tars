define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/entity/IStats", "../../../../IContext", "../../../../IObjective", "../../../../Objective", "../AcquireItem", "../../../contextData/SetContextData", "../../../core/ExecuteAction", "../../../core/Lambda"], function (require, exports, IAction_1, IItem_1, IStats_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, Lambda_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireUseOrbOfInfluence extends Objective_1.default {
        getIdentifier() {
            return "AcquireUseOrbOfInfluence";
        }
        getStatus() {
            return "Acquiring and using an orb of influence";
        }
        async execute(context) {
            const malign = context.player.stat.get(IStats_1.Stat.Malignity);
            if (malign < 5000) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            const orbOfInfluenceItem = itemManager.getItemInContainer(context.player.inventory, IItem_1.ItemType.OrbOfInfluence);
            if (!orbOfInfluenceItem) {
                objectives.push(new AcquireItem_1.default(IItem_1.ItemType.OrbOfInfluence));
            }
            else {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, orbOfInfluenceItem));
            }
            objectives.push(new Lambda_1.default(async (context) => {
                const item = context.getData(IContext_1.ContextDataType.LastAcquiredItem);
                if (!item) {
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return (new ExecuteAction_1.default(IAction_1.ActionType.RubCounterclockwise, (context, action) => {
                    action.execute(context.player, item);
                }).setStatus(this));
            }));
            return objectives;
        }
    }
    exports.default = AcquireUseOrbOfInfluence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVVzZU9yYk9mSW5mbHVlbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVVc2VPcmJPZkluZmx1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUV2RCxhQUFhO1lBQ25CLE9BQU8sMEJBQTBCLENBQUM7UUFDbkMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHlDQUF5QyxDQUFDO1FBQ2xELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7WUFDeEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFO2dCQUNsQixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzdHLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2FBRTFEO2lCQUFNO2dCQUNOLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQzFGO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO2dCQUMxQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUMvQjtnQkFHRCxPQUFPLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzdFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLE9BQU8sVUFBVSxDQUFDO1FBQ25CLENBQUM7S0FFRDtJQXpDRCwyQ0F5Q0MifQ==