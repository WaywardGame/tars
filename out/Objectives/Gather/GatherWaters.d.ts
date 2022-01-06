import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherWaterOptions } from "./GatherWater";
export default class GatherWaters extends Objective {
    private readonly waterContainers;
    private readonly options?;
    constructor(waterContainers: Item[], options?: Partial<IGatherWaterOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
