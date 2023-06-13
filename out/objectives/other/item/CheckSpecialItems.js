/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/item/IItem", "game/entity/action/actions/Read", "game/entity/action/actions/OpenBottle", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../core/ExecuteAction", "./MoveItemIntoInventory"], function (require, exports, IItem_1, Read_1, OpenBottle_1, IObjective_1, Objective_1, ExecuteActionForItem_1, ReserveItems_1, ExecuteAction_1, MoveItemIntoInventory_1) {
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
                    new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Generic, [IItem_1.ItemType.GlassBottle], {
                        genericAction: {
                            action: OpenBottle_1.default,
                            args: [item],
                        },
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
                        new ExecuteAction_1.default(Read_1.default, [item]).setStatus(`Reading ${item.getName()}`),
                    ]));
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckSpecialItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tTcGVjaWFsSXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL0NoZWNrU3BlY2lhbEl0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWtCSCxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUU3QyxhQUFhO1lBQ2hCLE9BQU8sbUJBQW1CLENBQUM7UUFDL0IsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLDRCQUE0QixDQUFDO1FBQ3hDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvRCxNQUFNLGlCQUFpQixHQUFHLFNBQVM7aUJBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDOUIsT0FBTyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO29CQUN4QyxJQUFJLCtCQUFxQixDQUFDLElBQUksQ0FBQztvQkFDL0IsSUFBSSw4QkFBb0IsQ0FDcEIsd0NBQWlCLENBQUMsT0FBTyxFQUN6QixDQUFDLGdCQUFRLENBQUMsV0FBVyxDQUFDLEVBQ3RCO3dCQUNJLGFBQWEsRUFBRTs0QkFDWCxNQUFNLEVBQUUsb0JBQVU7NEJBQ2xCLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQzt5QkFDZjtxQkFDSixDQUFDLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDO2lCQUMzQyxDQUFDLENBQUMsQ0FBQzthQUNQO1lBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUNuQyxNQUFNLEtBQUssR0FBRyxTQUFTO3FCQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3RCLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7d0JBQ3hDLElBQUksK0JBQXFCLENBQUMsSUFBSSxDQUFDO3dCQUMvQixJQUFJLHVCQUFhLENBQUMsY0FBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztxQkFDekUsQ0FBQyxDQUFDLENBQUM7aUJBQ1A7YUFDSjtZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDbEMsQ0FBQztLQUVKO0lBOUNELG9DQThDQyJ9