import Item from "game/item/Item";
import Context from "../../core/context/Context";
import { IInventoryItemInfo } from "../../core/ITars";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class AnalyzeInventory extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getItems(context: Context, itemInfo: IInventoryItemInfo): Set<Item>;
    private isValid;
}
