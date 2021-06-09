import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";
import MoveToTarget from "../../core/MoveToTarget";

export default class MoveItemIntoInventory extends Objective {

    constructor(private readonly item?: Item) {
        super();
    }

    public getIdentifier(): string {
        return `MoveItemIntoInventory:${this.item}`;
    }

    public getStatus(): string {
        return `Moving ${this.item?.getName()} into inventory`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
        if (!item) {
            return ObjectiveResult.Restart;
        }

        if (itemManager.isContainableInContainer(item, context.player.inventory)) {
            return ObjectiveResult.Complete;
        }

        const point = item.getPoint();
        if (!point) {
            return ObjectiveResult.Impossible;
        }

        return [
            new MoveToTarget(point, true),
            new ExecuteAction(ActionType.MoveItem, (context, action) => {
                action.execute(context.player, item, context.player.inventory);
            }),
        ];
    }

}
