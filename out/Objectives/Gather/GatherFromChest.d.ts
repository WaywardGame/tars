import { ItemType } from "game/item/IItem";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { IGatherItemOptions } from "../acquire/item/AcquireBase";
export default class GatherFromChest extends Objective {
    private readonly itemType;
    private readonly options;
    constructor(itemType: ItemType, options?: Partial<IGatherItemOptions>);
    getIdentifier(context?: Context): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
