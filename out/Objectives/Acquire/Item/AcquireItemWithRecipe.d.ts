import type { IRecipe } from "game/item/IItem";
import { ItemType } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import AcquireBase from "./AcquireBase";
export default class AcquireItemWithRecipe extends AcquireBase {
    private readonly itemType;
    private readonly recipe;
    private readonly allowInventoryItems?;
    constructor(itemType: ItemType, recipe: IRecipe, allowInventoryItems?: boolean | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getObjectives;
}
