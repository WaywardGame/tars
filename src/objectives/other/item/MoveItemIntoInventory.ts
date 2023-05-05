import { IContainer } from "game/item/IItem";
import type Item from "game/item/Item";
import Tile from "game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import MoveItem from "./MoveItem";

export default class MoveItemIntoInventory extends Objective {

    constructor(private readonly item?: Item, private readonly tile?: Tile, private readonly targetContainer?: IContainer) {
        super();
    }

    public getIdentifier(): string {
        return `MoveItemIntoInventory:${this.item}`;
    }

    public getStatus(): string | undefined {
        return `Moving ${this.item?.getName()} into inventory`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const item = this.item ?? this.getAcquiredItem(context);
        if (!item?.isValid()) {
            this.log.warn(`Unable to move item "${item}" into the inventory`);
            return ObjectiveResult.Restart;
        }

        if (context.island.items.isContainableInContainer(item, context.human.inventory)) {
            return ObjectiveResult.Complete;
        }

        const tile = this.tile ?? item.tile;
        if (!tile) {
            return ObjectiveResult.Impossible;
        }

        return [
            // todo: should planner be smart enough to make this happen automatically? this is required to avoid NotPlausible issues with GatherFromChest
            new MoveToTarget(tile, true, { skipIfAlreadyThere: true }).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
            new MoveItem(item, this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, item), tile),
        ];
    }

}
