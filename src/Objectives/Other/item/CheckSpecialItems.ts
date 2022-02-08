import { BookType, ItemType } from "game/item/IItem";
import { ActionType } from "game/entity/action/IAction";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ReserveItems from "../../core/ReserveItems";
import ExecuteAction from "../../core/ExecuteAction";
import MoveItemIntoInventory from "./MoveItemIntoInventory";

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
        const baseItems = context.utilities.item.getBaseItems(context);

        const messageInABottles = baseItems
            .filter(item => item.type === ItemType.MessageInABottle);
        if (messageInABottles.length > 0) {
            return messageInABottles.map(item => ([
                new ReserveItems(item).keepInInventory(),
                new MoveItemIntoInventory(item),
                new ExecuteActionForItem(ExecuteActionType.Generic, [ItemType.GlassBottle], ActionType.OpenBottle, (context, action) => {
                    action.execute(context.actionExecutor, item);
                }).setStatus("Opening glass bottle")
            ]));
        }

        if (context.options.survivalReadBooks) {
            const books = baseItems
                .filter(item => item.book === BookType.RandomEvent);
            if (books.length > 0) {
                return books.map(item => ([
                    new ReserveItems(item).keepInInventory(),
                    new MoveItemIntoInventory(item),
                    new ExecuteAction(ActionType.Read, (context, action) => {
                        action.execute(context.actionExecutor, item);
                        return ObjectiveResult.Complete;
                    }).setStatus(`Reading ${item.getName()}`),
                ]));
            }
        }

        return ObjectiveResult.Ignore;
    }

}
