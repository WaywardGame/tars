import { ItemType } from "game/item/IItem";

import Context from "../../core/context/Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

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
