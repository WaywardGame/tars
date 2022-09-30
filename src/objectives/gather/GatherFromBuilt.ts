import { DoodadType } from "game/doodad/IDoodad";
import PickUp from "game/entity/action/actions/PickUp";
import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
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
        return context.utilities.object.findDoodads(context, this.getIdentifier(), doodad => {
            if (doodad.type !== this.doodadtype || context.utilities.base.isBaseDoodad(context, doodad)) {
                return false;
            }

            if (context.options.goodCitizen && multiplayer.isConnected() && doodad.getBuilder() !== context.human) {
                // prevent picking up doodads placed by others
                return false;
            }

            return true;
        }, 5)
            .map(target => ([
                new MoveToTarget(target, true),
                new ClearTile(target),
                new ExecuteActionForItem(
                    ExecuteActionType.Generic,
                    [this.itemType],
                    {
                        genericAction: {
                            action: PickUp,
                            args: [],
                        },
                    }).passAcquireData(this)
                    .setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, this.doodadtype).getString()} from ${target.getName()}`),
            ]));
    }

    protected override getBaseDifficulty(context: Context): number {
        return 20;
    }

}
