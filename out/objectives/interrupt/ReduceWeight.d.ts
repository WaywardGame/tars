import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IOriganizeInventoryOptions } from "../utility/OrganizeInventory";
export default class ReduceWeight extends Objective {
    private readonly options;
    constructor(options?: Partial<IOriganizeInventoryOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canSaveChildObjectives(): boolean;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
