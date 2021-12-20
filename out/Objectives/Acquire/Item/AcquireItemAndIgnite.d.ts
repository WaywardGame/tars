import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
export default class AcquireItemAndIgnite extends Objective {
    private readonly itemType;
    constructor(itemType: ItemType);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
