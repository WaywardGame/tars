import Item from "game/item/Item";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IGatherWaterFromStillOptions } from "./GatherWaterFromStill";
export interface IGatherWaterOptions extends IGatherWaterFromStillOptions {
    disallowRecipe: boolean;
    disallowTerrain: boolean;
    disallowWaterStill: boolean;
    disallowWell: boolean;
}
export default class GatherWater extends Objective {
    private readonly waterContainer?;
    private readonly options?;
    constructor(waterContainer?: Item | undefined, options?: Partial<IGatherWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
