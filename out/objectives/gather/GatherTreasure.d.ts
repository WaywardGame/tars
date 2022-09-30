import DrawnMap from "game/mapping/DrawnMap";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IGatherTreasureOptions {
    disableUnlocking: boolean;
    disableGrabbingItems: boolean;
}
export default class GatherTreasure extends Objective {
    private readonly drawnMap;
    private readonly options?;
    constructor(drawnMap: DrawnMap, options?: Partial<IGatherTreasureOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
