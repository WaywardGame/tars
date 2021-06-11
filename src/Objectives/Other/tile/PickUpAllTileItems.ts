import { ActionType } from "game/entity/action/IAction";
import { IVector3 } from "utilities/math/IVector";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";

import ExecuteAction from "../../core/ExecuteAction";

export default class PickUpAllTileItems extends Objective {

    constructor(private readonly target: IVector3) {
        super();
    }

    public getIdentifier(): string {
        return `PickUpAllTileItems:${this.target.x},${this.target.y},${this.target.z}`;
    }

    public getStatus(): string {
        return `Picking up all items on ${this.target.x},${this.target.y},${this.target.z}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const targetTile = game.getTileFromPoint(this.target);
        if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
            return ObjectiveResult.Complete;
        }

        const objectives: IObjective[] = [];

        for (const item of targetTile.containedItems) {
            objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
                action.execute(context.player, item, context.player.inventory);
            }));
        }

        return objectives;
    }

}
