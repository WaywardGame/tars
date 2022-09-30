import DrawnMap from "game/mapping/DrawnMap";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import GatherTreasure, { IGatherTreasureOptions } from "./GatherTreasure";

/**
 * Gathers treasure from the easiest drawn map
 */
export default class GatherTreasures extends Objective {

    constructor(private readonly drawnMaps: DrawnMap[], private readonly options?: Partial<IGatherTreasureOptions>) {
        super();
    }

    public getIdentifier(): string {
        return `GatherTreasures:${this.drawnMaps.join(",")}`;
    }

    public getStatus(): string | undefined {
        return "Gathering treasure";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return this.drawnMaps.map(drawnMap => [new GatherTreasure(drawnMap, this.options)]);
    }

}
