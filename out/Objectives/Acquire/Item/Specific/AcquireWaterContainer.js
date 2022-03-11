define(["require", "exports", "game/entity/action/IAction", "game/item/IItem", "../../../../core/context/IContext", "../../../../core/objective/Objective", "../../../contextData/SetContextData", "../../../core/ExecuteActionForItem", "../AcquireItem"], function (require, exports, IAction_1, IItem_1, IContext_1, Objective_1, SetContextData_1, ExecuteActionForItem_1, AcquireItem_1) {
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
            const messageInABottleItem = context.utilities.item.getItemInInventory(context, IItem_1.ItemType.MessageInABottle);
            if (!messageInABottleItem) {
                messageInABottleObjectives.push(new AcquireItem_1.default(IItem_1.ItemType.MessageInABottle).passAcquireData(this).setContextDataKey(IContext_1.ContextDataType.Item1));
            }
            else {
                messageInABottleObjectives.push(new SetContextData_1.default(IContext_1.ContextDataType.Item1, messageInABottleItem));
            }
            messageInABottleObjectives.push(new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], {
                actionType: IAction_1.ActionType.OpenBottle,
                executor: (context, action) => {
                    const item = context.getData(IContext_1.ContextDataType.Item1);
                    if (!item?.isValid()) {
                        this.log.warn(`Invalid message in a bottle item. ${messageInABottleItem}`);
                        return;
                    }
                    action.execute(context.actionExecutor, item);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZVdhdGVyQ29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL3NwZWNpZmljL0FjcXVpcmVXYXRlckNvbnRhaW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixxQkFBc0IsU0FBUSxtQkFBUztRQUVwRCxhQUFhO1lBQ25CLE9BQU8sdUJBQXVCLENBQUM7UUFDaEMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDZCQUE2QixDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sMEJBQTBCLEdBQWlCLEVBQUUsQ0FBQztZQUVwRCxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxnQkFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDM0csSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMxQiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsaUJBQWlCLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBRTNJO2lCQUFNO2dCQUNOLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLHdCQUFjLENBQUMsMEJBQWUsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2FBQ2pHO1lBRUQsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksOEJBQW9CLENBQ3ZELHdDQUFpQixDQUFDLE9BQU8sRUFDekIsQ0FBQyxnQkFBUSxDQUFDLFdBQVcsQ0FBQyxFQUN0QjtnQkFDQyxVQUFVLEVBQUUsb0JBQVUsQ0FBQyxVQUFVO2dCQUNqQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzdCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsRUFBRTt3QkFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMscUNBQXFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQzt3QkFDM0UsT0FBTztxQkFDUDtvQkFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlDLENBQUM7YUFDRCxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUV2QyxPQUFPO2dCQUNOLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxDQUFDLElBQUkscUJBQVcsQ0FBQyxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzdELDBCQUEwQjthQUMxQixDQUFDO1FBQ0gsQ0FBQztLQUVEO0lBN0NELHdDQTZDQyJ9