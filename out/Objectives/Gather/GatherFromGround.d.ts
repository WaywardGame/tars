import { ItemType } from "game/item/IItem";
import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { IGatherItemOptions } from "../acquire/item/AcquireBase";
export default class GatherFromGround extends Objective {
    private readonly itemType;
    private readonly options;
    readonly gatherObjectivePriority = 500;
    constructor(itemType: ItemType, options?: Partial<IGatherItemOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private itemMatches;
}
