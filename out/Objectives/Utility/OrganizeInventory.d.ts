import Item from "game/item/Item";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
export interface IOriganizeInventoryOptions {
    allowChests?: boolean;
    disableDrop?: boolean;
    onlyIfNearBase?: boolean;
    allowReservedItems?: boolean;
    onlyOrganizeReservedItems?: boolean;
    onlyAllowIntermediateChest?: boolean;
    items?: Item[];
}
export default class OrganizeInventory extends Objective {
    private readonly options;
    constructor(options?: IOriganizeInventoryOptions);
    getIdentifier(): string;
    getStatus(): string | undefined;
    canIncludeContextHashCode(): boolean;
    shouldIncludeContextHashCode(context: Context): boolean;
    execute(context: Context): Promise<ObjectiveExecutionResult>;
    static moveIntoChestsObjectives(context: Context, itemsToMove: Item[]): IObjective[] | undefined;
    private static moveIntoChestObjectives;
}
