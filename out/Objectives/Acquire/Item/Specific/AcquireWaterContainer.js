define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../../../IContext", "../../../../Objective", "../../../ContextData/SetContextData", "../../../Core/ExecuteActionForItem", "../AcquireItem"], function (require, exports, IAction_1, IItem_1, IContext_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, AcquireItem_1) {
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
            const messageInABottleItem = itemManager.getItemInContainer(context.player.inventory, IItem_1.ItemType.MessageInABottle);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZS9JdGVtL1NwZWNpZmljL0FjcXVpcmVXYXRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUVwRCxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDZCQUE2QixDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sMEJBQTBCLEdBQWlCLEVBQUUsQ0FBQztZQUVwRCxNQUFNLG9CQUFvQixHQUFHLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxnQkFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakgsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMxQiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2FBRTVFO2lCQUFNO2dCQUNOLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7YUFDNUc7WUFFRCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSw4QkFBb0IsQ0FBQyx3Q0FBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFLG9CQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN0SixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDL0IsT0FBTztpQkFDUDtnQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUV0QyxPQUFPO2dCQUNOLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3JDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25DLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3ZDLDBCQUEwQjthQUMxQixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBdkNELHdDQXVDQyJ9