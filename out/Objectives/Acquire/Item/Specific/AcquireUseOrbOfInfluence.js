define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "game/entity/IStats", "../../../../IContext", "../../../../IObjective", "../../../../Objective", "../AcquireItem", "../../../contextData/SetContextData", "../../../core/ExecuteAction", "../../../core/Lambda", "../../../../utilities/Item"], function (require, exports, IAction_1, IItem_1, IStats_1, IContext_1, IObjective_1, Objective_1, AcquireItem_1, SetContextData_1, ExecuteAction_1, Lambda_1, Item_1) {
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
            if (malign < 5000) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectives = [];
            const orbOfInfluenceItem = Item_1.itemUtilities.getItemInInventory(context, IItem_1.ItemType.OrbOfInfluence);
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
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this));
            }));
            return objectives;
        }
    }
    exports.default = AcquireUseOrbOfInfluence;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVVzZU9yYk9mSW5mbHVlbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVVc2VPcmJPZkluZmx1ZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFjQSxNQUFxQix3QkFBeUIsU0FBUSxtQkFBUztRQUEvRDs7WUFFaUIsdUJBQWtCLEdBQUcsSUFBSSxDQUFDO1FBMEMzQyxDQUFDO1FBeENPLGFBQWE7WUFDbkIsT0FBTywwQkFBMEIsQ0FBQztRQUNuQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8seUNBQXlDLENBQUM7UUFDbEQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQztZQUN4RCxJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDOUI7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sa0JBQWtCLEdBQUcsb0JBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsZ0JBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5RixJQUFJLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzthQUUxRDtpQkFBTTtnQkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUMxRjtZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQkFBTSxDQUFDLEtBQUssRUFBQyxPQUFPLEVBQUMsRUFBRTtnQkFDMUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1YsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDL0I7Z0JBR0QsT0FBTyxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLG1CQUFtQixFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixPQUFPLFVBQVUsQ0FBQztRQUNuQixDQUFDO0tBRUQ7SUE1Q0QsMkNBNENDIn0=