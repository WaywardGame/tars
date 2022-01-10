import type Item from "game/item/Item";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export declare const gardenMaxTilesChecked = 1536;
export default class PlantSeed extends Objective {
    private readonly item?;
    constructor(item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
