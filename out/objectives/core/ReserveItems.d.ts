import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class ReserveItems extends Objective {
    items: Item[];
    private objectiveHashCode;
    constructor(...items: Item[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    passObjectiveHashCode(objectiveHashCode: string): this;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
