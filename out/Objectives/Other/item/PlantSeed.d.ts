import Item from "game/item/Item";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export declare const gardenMaxTilesChecked = 1536;
export default class PlantSeed extends Objective {
    private readonly seed?;
    constructor(seed?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
