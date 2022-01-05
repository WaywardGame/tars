import Item from "game/item/Item";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class ReserveItems extends Objective {
    items: Item[];
    constructor(...items: Item[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
