define(["require", "exports", "game/item/IItem", "game/entity/action/IAction", "../../../IObjective", "../../../Objective", "../../../utilities/Item", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "./MoveItemIntoInventory", "../../core/ExecuteAction"], function (require, exports, IItem_1, IAction_1, IObjective_1, Objective_1, Item_1, ExecuteActionForItem_1, ReserveItems_1, MoveItemIntoInventory_1, ExecuteAction_1) {
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
            const baseItems = Item_1.itemUtilities.getBaseItems(context);
            const messageInABottles = baseItems
                .filter(item => item.type === IItem_1.ItemType.MessageInABottle);
            if (messageInABottles.length > 0) {
                return messageInABottles.map(item => ([
                    new ReserveItems_1.default(item),
                    new MoveItemIntoInventory_1.default(item),
                    new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], IAction_1.ActionType.OpenBottle, (context, action) => {
                        action.execute(context.player, item);
                    }).setStatus("Opening glass bottle")
                ]));
            }
            const books = baseItems
                .filter(item => item.book === IItem_1.BookType.RandomEvent);
            if (books.length > 0) {
                return books.map(item => ([
                    new ReserveItems_1.default(item),
                    new MoveItemIntoInventory_1.default(item),
                    new ExecuteAction_1.default(IAction_1.ActionType.Read, (context, action) => {
                        action.execute(context.player, item);
                        return IObjective_1.ObjectiveResult.Complete;
                    }).setStatus(`Reading ${item.getName()}`),
                ]));
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckSpecialItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tTcGVjaWFsSXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL0NoZWNrU3BlY2lhbEl0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLGlCQUFrQixTQUFRLG1CQUFTO1FBRTdDLGFBQWE7WUFDaEIsT0FBTyxtQkFBbUIsQ0FBQztRQUMvQixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sNEJBQTRCLENBQUM7UUFDeEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxTQUFTLEdBQUcsb0JBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEQsTUFBTSxpQkFBaUIsR0FBRyxTQUFTO2lCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3RCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8saUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDbEMsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQztvQkFDdEIsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUM7b0JBQy9CLElBQUksOEJBQW9CLENBQUMsd0NBQWlCLENBQUMsT0FBTyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxvQkFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDbkgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUN6QyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7aUJBQ3ZDLENBQUMsQ0FBQyxDQUFDO2FBQ1A7WUFFRCxNQUFNLEtBQUssR0FBRyxTQUFTO2lCQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDeEQsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbEIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEIsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQztvQkFDdEIsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUM7b0JBQy9CLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNyQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO29CQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDLENBQUM7YUFDUDtZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDbEMsQ0FBQztLQUVKO0lBekNELG9DQXlDQyJ9