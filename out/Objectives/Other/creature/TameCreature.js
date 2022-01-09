define(["require", "exports", "game/entity/action/IAction", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../../core/context/IContext", "../../contextData/SetContextData", "../../acquire/item/AcquireItemForTaming"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, IContext_1, SetContextData_1, AcquireItemForTaming_1) {
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
            const items = context.utilities.item.getItemsInInventory(context, false);
            const offerItem = this.creature.offer(items);
            if (offerItem) {
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, offerItem));
            }
            else {
                objectives.push(new AcquireItemForTaming_1.default(this.creature).setContextDataKey(IContext_1.ContextDataType.Item1));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvVGFtZUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sVUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUMxQixPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDeEUsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sYUFBYSxHQUFHLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsMENBQUUsYUFBYSxDQUFDO1lBQ2pFLElBQUksQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlDLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO1lBRXBDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV6RSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO2FBRXpFO2lCQUFNO2dCQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsaUJBQWlCLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3JHO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFbkYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFcEYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3BFLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDUCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO29CQUNyQyxPQUFPLDRCQUFlLENBQUMsT0FBTyxDQUFDO2lCQUNsQztnQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXJDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFFcEIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUUvRSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEtBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsT0FBTyxDQUFDO1lBQ2xLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBCLE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FDSjtJQWhFRCwrQkFnRUMifQ==