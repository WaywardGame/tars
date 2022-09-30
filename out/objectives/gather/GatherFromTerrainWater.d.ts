import type Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { ITerrainWaterSearch } from "../../core/ITars";
export default class GatherFromTerrainWater extends Objective {
    private readonly search;
    private readonly waterContainerContextDataKey;
    constructor(search: ITerrainWaterSearch[], waterContainerContextDataKey: string);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
