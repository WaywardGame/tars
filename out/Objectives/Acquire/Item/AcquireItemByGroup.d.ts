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
