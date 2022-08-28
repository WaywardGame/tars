import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class CreateItemStockpile extends Objective {
    private readonly itemType;
    private readonly count;
    constructor(itemType: ItemType, count?: number);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}