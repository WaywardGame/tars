import type Doodad from "game/doodad/Doodad";
import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IGatherWaterFromStillOptions {
    allowStartingWaterStill: boolean;
    allowWaitingForWater?: boolean;
    onlyIdleWhenWaitingForWaterStill?: boolean;
}
export default class GatherWaterFromStill extends Objective {
    private readonly waterOrSolarStill;
    private readonly item;
    private readonly options?;
    constructor(waterOrSolarStill: Doodad, item: Item, options?: Partial<IGatherWaterFromStillOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
