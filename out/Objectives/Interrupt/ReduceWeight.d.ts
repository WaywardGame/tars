import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { IOriganizeInventoryOptions } from "../utility/OrganizeInventory";
export default class ReduceWeight extends Objective {
    private readonly options;
    constructor(options?: IOriganizeInventoryOptions);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canSaveChildObjectives(): boolean;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
