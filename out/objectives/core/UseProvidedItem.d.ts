import { ItemType } from "game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export default class UseProvidedItem extends Objective {
    private readonly itemType;
    readonly includePositionInHashCode: boolean;
    constructor(itemType: ItemType);
    getIdentifier(context: Context | undefined): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
}
