import DrawnMap from "game/mapping/DrawnMap";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IGatherTreasureOptions } from "./GatherTreasure";
export default class GatherTreasures extends Objective {
    private readonly drawnMaps;
    private readonly options?;
    constructor(drawnMaps: DrawnMap[], options?: Partial<IGatherTreasureOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
