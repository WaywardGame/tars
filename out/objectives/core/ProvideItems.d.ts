import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class ProvideItems extends Objective {
    readonly includePositionInHashCode: boolean;
    itemTypes: ItemType[];
    constructor(...itemTypes: ItemType[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
