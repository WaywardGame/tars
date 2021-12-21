define(["require", "exports", "game/entity/action/IAction", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../../utilities/Item", "../../../IContext", "../../contextData/SetContextData", "../../acquire/item/AcquireItemForTaming", "../../contextData/CopyContextData"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, Item_1, IContext_1, SetContextData_1, AcquireItemForTaming_1, CopyContextData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TameCreature extends Objective_1.default {
        constructor(creature) {
            super();
            this.creature = creature;
        }
        getIdentifier() {
            return `TameCreature:${this.creature}`;
        }
        getStatus() {
            return `Taming ${this.creature.getName()}`;
        }
        async execute(context) {
            var _a;
            if (!this.creature.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (this.creature.isTamed() && this.creature.getOwner() === context.player) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const acceptedItems = (_a = this.creature.description()) === null || _a === void 0 ? void 0 : _a.acceptedItems;
            if (!acceptedItems || acceptedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            const items = Item_1.itemUtilities.getItemsInInventory(context, false);
            const offerItem = this.creature.offer(items);
            if (offerItem) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, offerItem));
            }
            else {
                objectives.push(new AcquireItemForTaming_1.default(this.creature));
                objectives.push(new CopyContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, IContext_1.ContextDataType.Item1));
            }
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, this.creature));
            objectives.push(new MoveToTarget_1.default(this.creature, true).trackCreature(this.creature));
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Offer, (context, action) => {
                const item = context.getData(IContext_1.ContextDataType.Item1);
                if (!item) {
                    this.log.error("Invalid offer item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(context.player, item);
                return IObjective_1.ObjectiveResult.Complete;
            }).setStatus(this));
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, undefined));
            objectives.push(new Lambda_1.default(async (context) => {
                return this.creature.isValid() && this.creature.isTamed() && this.creature.getOwner() === context.player ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Restart;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = TameCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvVGFtZUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sVUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUMxQixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDeEUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sYUFBYSxHQUFHLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMENBQUUsYUFBYSxDQUFDO1lBQ2pFLElBQUksQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sS0FBSyxHQUFHLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWhFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdDLElBQUksU0FBUyxFQUFFO2dCQUNYLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFFekU7aUJBQU07Z0JBQ0gsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUd6RCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUkseUJBQWUsQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixFQUFFLDBCQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNqRztZQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRW5GLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRXBGLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNwRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxJQUFJLEVBQUU7b0JBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDckMsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztpQkFDbEM7Z0JBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFFL0UsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyw0QkFBZSxDQUFDLE9BQU8sQ0FBQztZQUNsSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwQixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBQ0o7SUFuRUQsK0JBbUVDIn0=