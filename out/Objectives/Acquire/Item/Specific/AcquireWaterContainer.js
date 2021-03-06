define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../../../IContext", "../../../../Objective", "../../../../utilities/Item", "../../../contextData/SetContextData", "../../../core/ExecuteActionForItem", "../AcquireItem"], function (require, exports, IAction_1, IItem_1, IContext_1, Objective_1, Item_1, SetContextData_1, ExecuteActionForItem_1, AcquireItem_1) {
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
            const messageInABottleObjectives = [];
            const messageInABottleItem = Item_1.itemUtilities.getItemInInventory(context, IItem_1.ItemType.MessageInABottle);
            if (!messageInABottleItem) {
                messageInABottleObjectives.push(new AcquireItem_1.default(IItem_1.ItemType.MessageInABottle));
            }
            else {
                messageInABottleObjectives.push(new SetContextData_1.default(IContext_1.ContextDataType.LastAcquiredItem, messageInABottleItem));
            }
            messageInABottleObjectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], IAction_1.ActionType.OpenBottle, (context, action) => {
                const item = context.getData(IContext_1.ContextDataType.LastAcquiredItem);
                if (!item) {
                    this.log.error("Invalid item");
                    return;
                }
                action.execute(context.player, item);
            }).setStatus("Opening glass bottle"));
            return [
                [new AcquireItem_1.default(IItem_1.ItemType.Waterskin)],
                [new AcquireItem_1.default(IItem_1.ItemType.ClayJug)],
                [new AcquireItem_1.default(IItem_1.ItemType.GlassBottle)],
                messageInABottleObjectives,
            ];
        }
    }
    exports.default = AcquireWaterContainer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVXYXRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUVwRCxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDZCQUE2QixDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sMEJBQTBCLEdBQWlCLEVBQUUsQ0FBQztZQUVwRCxNQUFNLG9CQUFvQixHQUFHLG9CQUFhLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsRyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzFCLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7YUFFNUU7aUJBQU07Z0JBQ04sMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixDQUFDLENBQUMsQ0FBQzthQUM1RztZQUVELDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsb0JBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ3RKLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNWLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUMvQixPQUFPO2lCQUNQO2dCQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBRXRDLE9BQU87Z0JBQ04sQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDckMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDdkMsMEJBQTBCO2FBQzFCLENBQUM7UUFDSCxDQUFDO0tBRUQ7SUF2Q0Qsd0NBdUNDIn0=