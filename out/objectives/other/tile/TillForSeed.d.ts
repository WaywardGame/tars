import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export declare const gardenMaxTilesChecked = 1536;
export default class TillForSeed extends Objective {
    private readonly itemType;
    private readonly maxTilesChecked;
    private readonly allowedTilesSet;
    constructor(itemType: ItemType, maxTilesChecked?: number | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getTillObjectives;
}
