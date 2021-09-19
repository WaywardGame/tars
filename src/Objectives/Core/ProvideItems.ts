import { ItemType } from "game/item/IItem";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

/**
 * Provides items that can be used by other objectives
 */
export default class ProvideItems extends Objective {

    public itemTypes: ItemType[];

    constructor(...itemTypes: ItemType[]) {
        super();

        this.itemTypes = itemTypes;
    }

    public getIdentifier(): string {
        return `ProvideItems:${this.itemTypes.map(itemType => ItemType[itemType]).join(",")}`;
    }

    public getStatus(): string | undefined {
        return undefined;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        context.addProvidedItems(this.itemTypes);
        return ObjectiveResult.Complete;
    }

}
