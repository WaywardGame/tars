import { ItemType } from "game/item/IItem";
import itemDescriptions from "game/item/Items";

import Context from "../../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { itemUtilities } from "../../../utilities/Item";
import AcquireItemWithRecipe from "../../acquire/item/AcquireItemWithRecipe";

/**
 * Looks for items in chests that are going to decay soon and trys to do something with them
 */
export default class CheckDecayingItems extends Objective {

    public getIdentifier(): string {
        return "CheckDecayingItems";
    }

    public getStatus(): string | undefined {
        return "Checking for decaying items in base chests";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        // it's very important to include items in inventory, so if this objective is restarted after grabing the item from the chest, it will continue to work
        const baseItemsWithDecay = itemUtilities.getBaseItems(context)
            .filter(item => item.decay !== undefined)

        const animalFatItemsDecayingSoon = baseItemsWithDecay
            .filter(item => item.type === ItemType.AnimalFat && item.decay! <= 500)
            .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        if (animalFatItemsDecayingSoon.length > 0) {
            return new AcquireItemWithRecipe(ItemType.Tallow, itemDescriptions[ItemType.Tallow].recipe!);
        }

        const offalItemsDecayingSoon = baseItemsWithDecay
            .filter(item => item.type === ItemType.Offal && item.decay! <= 200)
            .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        if (offalItemsDecayingSoon.length > 0) {
            return new AcquireItemWithRecipe(ItemType.AnimalGlue, itemDescriptions[ItemType.AnimalGlue].recipe!);
        }

        return ObjectiveResult.Ignore;
    }

}
