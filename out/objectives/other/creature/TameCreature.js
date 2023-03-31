define(["require", "exports", "game/entity/action/actions/Offer", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../../core/context/IContext", "../../contextData/SetContextData", "../../acquire/item/AcquireItemForTaming", "../../core/ReserveItems"], function (require, exports, Offer_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, IContext_1, SetContextData_1, AcquireItemForTaming_1, ReserveItems_1) {
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
            if (!this.creature.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (this.creature.isTamed() && this.creature.getOwner() === context.human) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const acceptedItems = this.creature.description?.acceptedItems;
            if (!acceptedItems || acceptedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemContextDataKey = this.getUniqueContextDataKey("OfferItem");
            const objectives = [];
            const items = context.utilities.item.getItemsInInventory(context);
            const offerItem = this.creature.offer(items);
            if (offerItem) {
                objectives.push(new ReserveItems_1.default(offerItem).keepInInventory());
                objectives.push(new SetContextData_1.default(itemContextDataKey, offerItem));
            }
            else {
                objectives.push(new AcquireItemForTaming_1.default(this.creature).setContextDataKey(itemContextDataKey));
            }
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, this.creature));
            objectives.push(new MoveToTarget_1.default(this.creature, true));
            objectives.push(new ExecuteAction_1.default(Offer_1.default, (context) => {
                const item = context.getData(itemContextDataKey);
                if (!item?.isValid()) {
                    this.log.error("Invalid offer item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                return [item];
            }).setStatus(this));
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, undefined));
            objectives.push(new Lambda_1.default(async (context) => {
                return this.creature.isValid() && this.creature.isTamed() && this.creature.getOwner() === context.human ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Restart;
            }).setStatus(this));
            return objectives;
        }
    }
    exports.default = TameCreature;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvVGFtZUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxNQUFxQixZQUFhLFNBQVEsbUJBQVM7UUFFL0MsWUFBNkIsUUFBa0I7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEaUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLGdCQUFnQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0MsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLFVBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUMxQixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDdkUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQztZQUMvRCxJQUFJLENBQUMsYUFBYSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFckUsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBRXRFO2lCQUFNO2dCQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2FBQ2xHO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFbkYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXZELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLGVBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNqRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7aUJBQ2xDO2dCQUVELE9BQU8sQ0FBQyxJQUFJLENBQWtDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUUvRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2pLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FDSjtJQWpFRCwrQkFpRUMifQ==