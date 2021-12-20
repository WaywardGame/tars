import { ItemType } from "game/item/IItem";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export default class ProvideItems extends Objective {
    itemTypes: ItemType[];
    constructor(...itemTypes: ItemType[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
