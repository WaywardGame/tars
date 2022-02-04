import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
export default class GatherFromGround extends Objective {
    private readonly itemType;
    private readonly options;
    readonly gatherObjectivePriority = 500;
    constructor(itemType: ItemType, options?: Partial<IGatherItemOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    canIncludeContextHashCode(): Set<ItemType>;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private itemMatches;
}
