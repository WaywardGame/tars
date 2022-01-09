import type Doodad from "game/doodad/Doodad";
import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class GatherWaterFromWell extends Objective {
    private readonly well;
    private readonly item;
    constructor(well: Doodad, item: Item);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
