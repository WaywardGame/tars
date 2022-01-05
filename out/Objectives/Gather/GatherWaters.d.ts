import Item from "game/item/Item";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IGatherWaterOptions } from "./GatherWater";
export default class GatherWaters extends Objective {
    private readonly waterContainers;
    private readonly options?;
    constructor(waterContainers: Item[], options?: Partial<IGatherWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
