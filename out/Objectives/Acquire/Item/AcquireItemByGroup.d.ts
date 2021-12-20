import { ItemTypeGroup } from "game/item/IItem";
import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import AcquireBase, { IAcquireItemOptions } from "./AcquireBase";
export default class AcquireItemByGroup extends AcquireBase {
    private readonly itemTypeGroup;
    private readonly options;
    private static readonly cache;
    constructor(itemTypeGroup: ItemTypeGroup, options?: Partial<IAcquireItemOptions>);
    getIdentifier(): string;
    getStatus(context: Context): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    private getItemTypes;
}
