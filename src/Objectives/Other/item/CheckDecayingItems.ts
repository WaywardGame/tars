import { ItemType } from "game/item/IItem";
import itemDescriptions from "game/item/Items";

import Context from "../../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import AcquireItemWithRecipe from "../../acquire/item/AcquireItemWithRecipe";

/**
 * Looks for items in chests that are going to decay soon and trys to do something with them
 */
export default class CheckDecayingItems extends Objective {

    public getIdentifier(): string {
        return "CheckDecayingItems";
    }

    public getStatus(): string {
        return "Checking for decaying items in base chests";
    }

    public async execute(context: Context): Promise<ObjectiveExecutionResult> {
        const animalFatItems = context.base.chest
            .map(chest => itemManager.getItemsInContainer(chest, true)
                .filter(item => item.type === ItemType.AnimalFat && item.decay !== undefined && item.decay <= 500))
            .flat()
            .sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
        if (animalFatItems.length > 0) {
            return new AcquireItemWithRecipe(ItemType.Tallow, itemDescriptions[ItemType.Tallow].recipe!);
        }

        return ObjectiveResult.Ignore;
    }

}
