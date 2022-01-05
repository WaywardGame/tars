import { ItemType } from "game/item/IItem";
import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
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
