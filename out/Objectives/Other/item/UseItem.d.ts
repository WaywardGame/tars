import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class UseItem extends Objective {
    private readonly actionType;
    private readonly item?;
    constructor(actionType: ActionType, item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
