import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { IInventoryItemInfo } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class AnalyzeInventory extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getItems(context: Context, itemInfo: IInventoryItemInfo): Set<Item>;
    private isValid;
}
