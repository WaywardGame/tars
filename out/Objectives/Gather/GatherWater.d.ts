import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export interface IGatherWaterOptions {
    allowStartingWaterStill?: boolean;
    allowWaitingForWaterStill?: boolean;
    disallowRecipe?: boolean;
    disallowTerrain?: boolean;
    disallowWaterStill?: boolean;
    disallowWell?: boolean;
}
export default class GatherWater extends Objective {
    private readonly waterContainer?;
    private readonly options?;
    constructor(waterContainer?: Item | undefined, options?: IGatherWaterOptions | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
