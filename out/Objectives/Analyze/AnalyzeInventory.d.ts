import Item from "game/item/Item";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { IInventoryItemInfo } from "../../ITars";
import Objective from "../../Objective";
export default class AnalyzeInventory extends Objective {
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getItems(context: Context, itemInfo: IInventoryItemInfo): Set<Item>;
    private isValid;
}
