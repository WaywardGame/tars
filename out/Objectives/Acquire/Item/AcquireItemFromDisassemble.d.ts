import { ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import { IDisassemblySearch } from "../../../ITars";
import Objective from "../../../Objective";
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
