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
import type { ItemType } from "game/item/IItem";
import { ItemTypeGroup } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
export default class AcquireItemByGroup extends AcquireBase {
    private readonly itemTypeGroup;
    private readonly options;
    private static readonly cache;
    constructor(itemTypeGroup: ItemTypeGroup, options?: Partial<IAcquireItemOptions>);
    getIdentifier(): string;
    getStatus(context: Context): string | undefined;
    canIncludeContextHashCode(): boolean | Set<ItemType>;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getItemTypes;
}
