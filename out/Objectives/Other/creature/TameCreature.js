define(["require", "exports", "game/entity/action/IAction", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Lambda", "../../core/MoveToTarget", "../../../core/context/IContext", "../../contextData/SetContextData", "../../acquire/item/AcquireItemForTaming", "../../core/ReserveItems"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1, Lambda_1, MoveToTarget_1, IContext_1, SetContextData_1, AcquireItemForTaming_1, ReserveItems_1) {
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
            const player = context.human.asPlayer;
            if (!player) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            if (!this.creature.isValid()) {
                return IObjective_1.ObjectiveResult.Restart;
            }
            if (this.creature.isTamed() && this.creature.getOwner() === context.human) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const acceptedItems = this.creature.description()?.acceptedItems;
            if (!acceptedItems || acceptedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectives = [];
            const items = context.utilities.item.getItemsInInventory(context);
            const offerItem = this.creature.offer(items);
            if (offerItem) {
                objectives.push(new ReserveItems_1.default(offerItem).keepInInventory());
                objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, offerItem));
            }
            else {
                objectives.push(new AcquireItemForTaming_1.default(this.creature).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            objectives.push(new SetContextData_1.default(IContext_1.ContextDataType.TamingCreature, this.creature));
            objectives.push(new MoveToTarget_1.default(this.creature, true));
            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Offer, (context, action) => {
                const item = context.getData(IContext_1.ContextDataType.Item1);
                if (!item?.isValid()) {
                    this.log.error("Invalid offer item");
                    return IObjective_1.ObjectiveResult.Restart;
                }
                action.execute(player, item);
                return IObjective_1.ObjectiveResult.Complete;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFtZUNyZWF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvY3JlYXR1cmUvVGFtZUNyZWF0dXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQyxDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sVUFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDVCxPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQzFCLE9BQU8sNEJBQWUsQ0FBQyxPQUFPLENBQUM7YUFDbEM7WUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLENBQUMsS0FBSyxFQUFFO2dCQUN2RSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxhQUFhLENBQUM7WUFDakUsSUFBSSxDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDOUMsT0FB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