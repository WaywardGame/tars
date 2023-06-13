/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/ItemDescriptions";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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
        const baseItemsWithDecay = context.utilities.item.getBaseItems(context)
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
