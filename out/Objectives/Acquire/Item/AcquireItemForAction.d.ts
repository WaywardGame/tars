import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class AcquireItemForAction extends Objective {
    private readonly actionType;
    private static readonly cache;
    constructor(actionType: ActionType);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static getItems(context: Context, actionType: ActionType): ItemType[];
}
