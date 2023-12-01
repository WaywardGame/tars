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
import { ItemType } from "@wayward/game/game/item/IItem";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
export default class GatherFromChest extends Objective {
    private readonly itemType;
    private readonly options;
    constructor(itemType: ItemType, options?: Partial<IGatherItemOptions>);
    getIdentifier(context: Context | undefined): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(context: Context, objectiveHashCode: string): {
        objectiveHashCode: string;
        itemTypes: Set<ItemType>;
    };
    shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean;
    execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult>;
}
