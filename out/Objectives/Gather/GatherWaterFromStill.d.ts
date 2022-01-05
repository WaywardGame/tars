import Doodad from "game/doodad/Doodad";
import Item from "game/item/Item";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IGatherWaterFromStillOptions {
    allowStartingWaterStill: boolean;
    allowWaitingForWaterStill?: boolean;
    onlyIdleWhenWaitingForWaterStill?: boolean;
}
export default class GatherWaterFromStill extends Objective {
    private readonly waterStill;
    private readonly item;
    private readonly options?;
    constructor(waterStill: Doodad, item: Item, options?: Partial<IGatherWaterFromStillOptions> | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
