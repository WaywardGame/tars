import { BookType, ItemType } from "game/item/IItem";
import { ActionType } from "game/entity/action/IAction";

import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { itemUtilities } from "../../../utilities/Item";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ReserveItems from "../../core/ReserveItems";
import MoveItemIntoInventory from "./MoveItemIntoInventory";
import ExecuteAction from "../../core/ExecuteAction";

/**
 * Looks for items that are special and try to use them
 */
export default class CheckSpecialItems extends Objective {

    public getIdentifier(): string {
        return "CheckSpecialItems";
    }

    public getStatus(): string | undefined {
        return "Checking for special items";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const baseItems = itemUtilities.getBaseItems(context);

        const messageInABottles = baseItems
            .filter(item => item.type === ItemType.MessageInABottle);
        if (messageInABottles.length > 0) {
            return messageInABottles.map(item => ([
                new ReserveItems(item),
                new MoveItemIntoInventory(item),
                new ExecuteActionForItem(ExecuteActionType.Generic, [ItemType.GlassBottle], ActionType.OpenBottle, (context, action) => {
                    action.execute(context.player, item);
                }).setStatus("Opening glass bottle")
            ]));
        }

        const books = baseItems
            .filter(item => item.book === BookType.RandomEvent);
        if (books.length > 0) {
            return books.map(item => ([
                new ReserveItems(item),
                new MoveItemIntoInventory(item),
                new ExecuteAction(ActionType.Read, (context, action) => {
                    action.execute(context.player, item);
                    return ObjectiveResult.Complete;
                }).setStatus(`Reading ${item.getName()}`),
            ]));
        }

        return ObjectiveResult.Ignore;
    }

}
