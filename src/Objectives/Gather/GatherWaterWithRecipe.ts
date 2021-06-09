import Item from "game/item/Item";
import itemDescriptions from "game/item/Items";
import { ItemType } from "game/item/IItem";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";

import AcquireItemWithRecipe from "../acquire/item/AcquireItemWithRecipe";

/**
 * Gathers unpurified water into a container with a recipe
 */
export default class GatherWaterWithRecipe extends Objective {

    constructor(private readonly item?: Item) {
        super();
    }

    public getIdentifier(): string {
        return `GatherWaterWithRecipe:${this.item}`;
    }

    public getStatus(): string {
        return `Gathering water into ${this.item?.getName()}`;
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        if (!this.item) {
            return ObjectiveResult.Restart;
        }

        const baseItemType = this.item.description()?.returnOnUseAndDecay?.type ?? this.item.type;
        if (baseItemType !== undefined) {
            const baseItemDescription = itemDescriptions[baseItemType];
            const liquid = baseItemDescription?.gather;
            if (liquid !== undefined) {
                const unpurifiedItemType = liquid.unpurified;
                const purifiedItemType = liquid.purified;

                let targetItemType: ItemType | undefined;

                switch (this.item.type) {
                    case baseItemType:
                        // we have no water. acquire unpurified water
                        targetItemType = unpurifiedItemType;
                        break;

                    case unpurifiedItemType:
                        // we have unpurified water. the next step is to purify it
                        targetItemType = purifiedItemType;
                        break;
                }

                if (targetItemType !== undefined) {
                    const targetItemDescription = itemDescriptions[targetItemType];
                    if (targetItemDescription?.recipe !== undefined) {
                        return new AcquireItemWithRecipe(targetItemType, targetItemDescription.recipe, true);
                    }
                }
            }
        }

        return ObjectiveResult.Impossible;
    }
}
