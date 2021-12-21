import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { IGatherWaterOptions } from "./GatherWater";
export default class GatherWaters extends Objective {
    private readonly waterContainers;
    private readonly options?;
    constructor(waterContainers: Item[], options?: Partial<IGatherWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
