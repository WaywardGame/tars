import { DoodadType } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";
import ClearTile from "../other/tile/ClearTile";

export default class GatherFromBuilt extends Objective {

    constructor(private readonly itemType: ItemType, private readonly doodadtype: DoodadType) {
        super();
    }

    public getIdentifier(): string {
        return `GatherFromBuilt:${ItemType[this.itemType]}:${DoodadType[this.doodadtype]}`;
    }

    public getStatus(): string | undefined {
        return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from built doodad`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return context.utilities.object.findDoodads(context, `${this.getIdentifier()}|1`, doodad => doodad.type === this.doodadtype, 5)
            .map(target => {
                const objectives: IObjective[] = [];

                objectives.push(new MoveToTarget(target, true));
                objectives.push(new ClearTile(target));
                objectives.push(new ExecuteActionForItem(
                    ExecuteActionType.Generic,
                    [this.itemType],
                    {
                        actionType: ActionType.Pickup,
                        executor: (context, action) => {
                            action.execute(context.actionExecutor);
                        },
                    }).passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, this.doodadtype).getString()} from ${target.getName()}`));
                return objectives;
            });
    }

    protected override getBaseDifficulty(context: Context): number {
        return 20;
    }

}
