import type Item from "game/item/Item";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { ObjectiveExecutionResult} from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import MoveItem from "./MoveItem";

export default class MoveItemIntoInventory extends Objective {

    constructor(private readonly item?: Item) {
        super();
    }

    public getIdentifier(): string {
        return `MoveItemIntoInventory:${this.item}`;
    }

    public getStatus(): string | undefined {
        return `Moving ${this.item?.getName()} into inventory`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
        if (!item) {
            this.log.error("Invalid move item");
            return ObjectiveResult.Restart;
        }

        if (context.island.items.isContainableInContainer(item, context.player.inventory)) {
            return ObjectiveResult.Complete;
        }

        const point = item.getPoint();
        if (!point) {
            return ObjectiveResult.Impossible;
        }

        return [
            // todo: should planner be smart enough to make this happen automatically? this is required to avoid NotPlausible issues with GatherFromChest
            new MoveToTarget(point, true).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
            new MoveItem(item, context.player.inventory, point),
        ];
    }

}
