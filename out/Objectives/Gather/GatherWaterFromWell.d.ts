import Doodad from "game/doodad/Doodad";
import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class GatherWaterFromWell extends Objective {
    private readonly well;
    private readonly item;
    constructor(well: Doodad, item: Item);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
