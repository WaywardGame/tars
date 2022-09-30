import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import Item from "game/item/Item";
export declare const gardenMaxTilesChecked = 1536;
export default class PlantSeed extends Objective {
    private readonly itemOrItemType;
    private readonly maxTilesChecked;
    constructor(itemOrItemType: Item | ItemType, maxTilesChecked?: number | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
