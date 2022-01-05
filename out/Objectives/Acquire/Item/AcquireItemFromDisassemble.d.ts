import { ItemType } from "game/item/IItem";
import Context from "../../../core/context/Context";
import { IDisassemblySearch } from "../../../core/ITars";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
export default class AcquireItemFromDisassemble extends Objective {
    private readonly itemType;
    private readonly searches;
    constructor(itemType: ItemType, searches: IDisassemblySearch[]);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
}
