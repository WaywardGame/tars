import Context from "../../core/context/Context";
import { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IOriganizeInventoryOptions } from "../utility/OrganizeInventory";
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
