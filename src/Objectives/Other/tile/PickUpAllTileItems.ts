import { IVector3 } from "utilities/math/IVector";

import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";

import MoveItem from "../item/MoveItem";

export default class PickUpAllTileItems extends Objective {

    constructor(private readonly target: IVector3) {
        super();
    }

    public getIdentifier(): string {
        return `PickUpAllTileItems:${this.target.x},${this.target.y},${this.target.z}`;
    }

    public getStatus(): string | undefined {
        return `Picking up all items on ${this.target.x},${this.target.y},${this.target.z}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const targetTile = context.island.getTileFromPoint(this.target);
        if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
            return ObjectiveResult.Complete;
        }

        return targetTile.containedItems.map(item => new MoveItem(item, context.player.inventory, this.target));
    }

}
