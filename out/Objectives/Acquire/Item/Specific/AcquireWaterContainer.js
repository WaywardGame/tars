define(["require", "exports", "game/item/IItem", "game/entity/action/actions/OpenBottle", "../../../../core/objective/IObjective", "../../../../core/objective/Objective", "../../../contextData/SetContextData", "../../../core/ExecuteActionForItem", "../../../core/ReserveItems", "../AcquireItem"], function (require, exports, IItem_1, OpenBottle_1, IObjective_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, ReserveItems_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireWaterContainer extends Objective_1.default {
        getIdentifier() {
            return "AcquireWaterContainer";
        }
        getStatus() {
            return "Acquiring a water container";
        }
        async execute(context) {
            const itemContextDataKey = this.getUniqueContextDataKey("MessageInABottle");
            const messageInABottleObjectives = [];
            const messageInABottleItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.MessageInABottle);
            if (messageInABottleItem) {
                messageInABottleObjectives.push(new ReserveItems_1.default(messageInABottleItem));
                messageInABottleObjectives.push(new SetContextData_1.default(itemContextDataKey, messageInABottleItem));
            }
            else {
                messageInABottleObjectives.push(new AcquireItem_1.default(IItem_1.ItemType.MessageInABottle).passAcquireData(this).setContextDataKey(itemContextDataKey));
            }
            messageInABottleObjectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], {
                genericAction: {
                    action: OpenBottle_1.default,
                    args: (context) => {
                        const item = context.getData(itemContextDataKey);
                        if (!item?.isValid()) {
                            this.log.warn(`Invalid message in a bottle item. ${messageInABottleItem}`);
                            return IObjective_1.ObjectiveResult.Restart;
                        }
                        return [item];
                    },
                },
            }).setStatus("Opening glass bottle"));
            return [
                [new AcquireItem_1.default(IItem_1.ItemType.Waterskin).passAcquireData(this)],
                [new AcquireItem_1.default(IItem_1.ItemType.ClayJug).passAcquireData(this)],
                [new AcquireItem_1.default(IItem_1.ItemType.GlassBottle).passAcquireData(this)],
                messageInABottleObjectives,
            ];
        }
    }
    exports.default = AcquireWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVXYXRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUVwRCxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDZCQUE2QixDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFFNUUsTUFBTSwwQkFBMEIsR0FBaUIsRUFBRSxDQUFDO1lBRXBELE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUMzRyxJQUFJLG9CQUFvQixFQUFFO2dCQUN6QiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDeEUsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQyxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7YUFFOUY7aUJBQU07Z0JBQ04sMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUN4STtZQUVELDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUN2RCx3Q0FBaUIsQ0FBQyxPQUFPLEVBQ3pCLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFDdEI7Z0JBQ0MsYUFBYSxFQUFFO29CQUNkLE1BQU0sRUFBRSxvQkFBVTtvQkFDbEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ2pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDakQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTs0QkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUNBQXFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzs0QkFDM0UsT0FBTyw0QkFBZSxDQUFDLE9BQU8sQ0FBQzt5QkFDL0I7d0JBRUQsT0FBTyxDQUFDLElBQUksQ0FBdUMsQ0FBQztvQkFDckQsQ0FBQztpQkFDRDthQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBRXZDLE9BQU87Z0JBQ04sQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNELENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN6RCxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDN0QsMEJBQTBCO2FBQzFCLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUFsREQsd0NBa0RDIn0=