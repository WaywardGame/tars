import { IRecipe, ItemType } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import AcquireBase from "./AcquireBase";
export default class AcquireItemWithRecipe extends AcquireBase {
    private readonly itemType;
    private readonly recipe;
    private readonly allowInventoryItems?;
    constructor(itemType: ItemType, recipe: IRecipe, allowInventoryItems?: boolean | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getObjectives;
}
