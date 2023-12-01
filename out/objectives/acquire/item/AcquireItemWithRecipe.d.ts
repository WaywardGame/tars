/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
import type { IRecipe } from "@wayward/game/game/item/IItem";
import { ItemType } from "@wayward/game/game/item/IItem";
import type Context from "../../../core/context/Context";
import { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import AcquireBase from "./AcquireBase";
export default class AcquireItemWithRecipe extends AcquireBase {
    private readonly itemType;
    private readonly recipe;
    private readonly allowInventoryItems?;
    private readonly recipeRequiresBaseDoodads;
    constructor(itemType: ItemType, recipe: IRecipe, allowInventoryItems?: boolean | undefined);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getObjectives;
}
