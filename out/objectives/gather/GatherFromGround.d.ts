import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
export default class GatherFromGround extends Objective {
    private readonly itemType;
    private readonly options;
    constructor(itemType: ItemType, options?: Partial<IGatherItemOptions>);
    getIdentifier(context: Context | undefined): string;
    getStatus(): string | undefined;
    canGroupTogether(): boolean;
    canIncludeContextHashCode(context: Context, objectiveHashCode: string): {
        objectiveHashCode: string;
        itemTypes: Set<ItemType>;
    };
    shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean;
    execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult>;
    protected getBaseDifficulty(context: Context): number;
    private itemMatches;
}
