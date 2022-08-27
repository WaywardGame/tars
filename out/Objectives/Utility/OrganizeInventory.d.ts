import type Item from "game/item/Item";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
export interface IOriganizeInventoryOptions {
    allowChests: boolean;
    disableDrop: boolean;
    onlyIfNearBase: boolean;
    allowReservedItems: boolean;
    allowInventoryItems: boolean;
    onlyOrganizeReservedItems: boolean;
    onlyAllowIntermediateChest: boolean;
    items: Item[];
}
export default class OrganizeInventory extends Objective {
    private readonly options;
    constructor(options?: Partial<IOriganizeInventoryOptions>);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static moveIntoChestsObjectives(context: Context, itemsToMove: Item[]): IObjective[] | undefined;
    private static moveIntoChestObjectives;
}
