define(["require", "exports", "game/item/IItem", "game/entity/action/IAction", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../core/ExecuteAction", "./MoveItemIntoInventory"], function (require, exports, IItem_1, IAction_1, IObjective_1, Objective_1, ExecuteActionForItem_1, ReserveItems_1, ExecuteAction_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CheckSpecialItems extends Objective_1.default {
        getIdentifier() {
            return "CheckSpecialItems";
        }
        getStatus() {
            return "Checking for special items";
        }
        async execute(context) {
            const baseItems = context.utilities.item.getBaseItems(context);
            const messageInABottles = baseItems
                .filter(item => item.type === IItem_1.ItemType.MessageInABottle);
            if (messageInABottles.length > 0) {
                return messageInABottles.map(item => ([
                    new ReserveItems_1.default(item).keepInInventory(),
                    new MoveItemIntoInventory_1.default(item),
                    new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], IAction_1.ActionType.OpenBottle, (context, action) => {
                        action.execute(context.actionExecutor, item);
                    }).setStatus("Opening glass bottle")
                ]));
            }
            if (context.options.survivalReadBooks) {
                const books = baseItems
                    .filter(item => item.book === IItem_1.BookType.RandomEvent);
                if (books.length > 0) {
                    return books.map(item => ([
                        new ReserveItems_1.default(item).keepInInventory(),
                        new MoveItemIntoInventory_1.default(item),
                        new ExecuteAction_1.default(IAction_1.ActionType.Read, (context, action) => {
                            action.execute(context.actionExecutor, item);
                            return IObjective_1.ObjectiveResult.Complete;
                        }).setStatus(`Reading ${item.getName()}`),
                    ]));
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckSpecialItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tTcGVjaWFsSXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL0NoZWNrU3BlY2lhbEl0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLGlCQUFrQixTQUFRLG1CQUFTO1FBRTdDLGFBQWE7WUFDaEIsT0FBTyxtQkFBbUIsQ0FBQztRQUMvQixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sNEJBQTRCLENBQUM7UUFDeEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRS9ELE1BQU0saUJBQWlCLEdBQUcsU0FBUztpQkFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxnQkFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0QsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM5QixPQUFPLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7b0JBQ3hDLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDO29CQUMvQixJQUFJLDhCQUFvQixDQUFDLHdDQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLEVBQUUsb0JBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ25ILE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO2lCQUN2QyxDQUFDLENBQUMsQ0FBQzthQUNQO1lBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUNuQyxNQUFNLEtBQUssR0FBRyxTQUFTO3FCQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3RCLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7d0JBQ3hDLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDO3dCQUMvQixJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDN0MsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzt3QkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7cUJBQzVDLENBQUMsQ0FBQyxDQUFDO2lCQUNQO2FBQ0o7WUFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1FBQ2xDLENBQUM7S0FFSjtJQTNDRCxvQ0EyQ0MifQ==