import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class UseItem extends Objective {
    private readonly actionType;
    private readonly item?;
    constructor(actionType: ActionType, item?: Item | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
