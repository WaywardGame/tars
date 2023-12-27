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
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/game/entity/action/actions/Read", "@wayward/game/game/entity/action/actions/OpenBottle", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteActionForItem", "../../core/ReserveItems", "../../core/ExecuteAction", "./MoveItemsIntoInventory"], function (require, exports, IItem_1, Read_1, OpenBottle_1, IObjective_1, Objective_1, ExecuteActionForItem_1, ReserveItems_1, ExecuteAction_1, MoveItemsIntoInventory_1) {
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
                    new MoveItemsIntoInventory_1.default(item),
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
                        new MoveItemsIntoInventory_1.default(item),
                        new ExecuteAction_1.default(Read_1.default, [item]).setStatus(`Reading ${item.getName()}`),
                    ]));
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = CheckSpecialItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlY2tTcGVjaWFsSXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9pdGVtL0NoZWNrU3BlY2lhbEl0ZW1zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWtCSCxNQUFxQixpQkFBa0IsU0FBUSxtQkFBUztRQUVoRCxhQUFhO1lBQ25CLE9BQU8sbUJBQW1CLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLDRCQUE0QixDQUFDO1FBQ3JDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUUvRCxNQUFNLGlCQUFpQixHQUFHLFNBQVM7aUJBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssZ0JBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzFELElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3JDLElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlLEVBQUU7b0JBQ3hDLElBQUksZ0NBQXNCLENBQUMsSUFBSSxDQUFDO29CQUNoQyxJQUFJLDhCQUFvQixDQUN2Qix3Q0FBaUIsQ0FBQyxPQUFPLEVBQ3pCLENBQUMsZ0JBQVEsQ0FBQyxXQUFXLENBQUMsRUFDdEI7d0JBQ0MsYUFBYSxFQUFFOzRCQUNkLE1BQU0sRUFBRSxvQkFBVTs0QkFDbEIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDO3lCQUNaO3FCQUNELENBQUMsQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUM7aUJBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLEtBQUssR0FBRyxTQUFTO3FCQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3JELElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDdEIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDekIsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWUsRUFBRTt3QkFDeEMsSUFBSSxnQ0FBc0IsQ0FBQyxJQUFJLENBQUM7d0JBQ2hDLElBQUksdUJBQWEsQ0FBQyxjQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO3FCQUN0RSxDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0YsQ0FBQztZQUVELE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsQ0FBQztLQUVEO0lBOUNELG9DQThDQyJ9