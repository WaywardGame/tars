import Item from "game/item/Item";
import Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export declare const gardenMaxTilesChecked = 1536;
export default class PlantSeed extends Objective {
    private readonly seed?;
    constructor(seed?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
