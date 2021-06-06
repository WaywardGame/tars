import { ItemType } from "game/item/IItem";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

/**
 * Trys to use a provided item
 */
export default class UseProvidedItem extends Objective {

    constructor(private readonly itemType: ItemType) {
        super();
    }

    public getIdentifier(): string {
        return `UseProvidedItem:${ItemType[this.itemType]}`;
    }

    public canIncludeContextHashCode(): boolean {
        return true;
    }

    public shouldIncludeContextHashCode(context: Context): boolean {
        return context.isReservedItemType(this.itemType);
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        return context.tryUseProvidedItems(this.itemType) ? ObjectiveResult.Complete : ObjectiveResult.Impossible;
    }

}
