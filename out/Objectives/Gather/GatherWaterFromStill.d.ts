import Doodad from "game/doodad/Doodad";
import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class GatherWaterFromStill extends Objective {
    private readonly waterStill;
    private readonly item;
    private readonly allowStartingWaterStill?;
    private readonly allowWaitingForWaterStill?;
    constructor(waterStill: Doodad, item: Item, allowStartingWaterStill?: boolean | undefined, allowWaitingForWaterStill?: boolean | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
