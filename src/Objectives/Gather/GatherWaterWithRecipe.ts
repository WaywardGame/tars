import type Item from "game/item/Item";
import itemDescriptions from "game/item/Items";
import type { ItemType } from "game/item/IItem";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

import AcquireItemWithRecipe from "../acquire/item/AcquireItemWithRecipe";
import ReserveItems from "../core/ReserveItems";

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

    public getStatus(): string | undefined {
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
                        return [
                            new ReserveItems(this.item).keepInInventory(),
                            new AcquireItemWithRecipe(targetItemType, targetItemDescription.recipe, true),
                        ];
                    }
                }
            }
        }

        return ObjectiveResult.Impossible;
    }
}
