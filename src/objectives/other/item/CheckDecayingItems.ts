import { ItemType } from "@wayward/game/game/item/IItem";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";

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
			.filter(item => item.getDecayTime() !== undefined);

		const animalFatItemsDecayingSoon = baseItemsWithDecay
			.filter(item => item.type === ItemType.AnimalFat && item.getDecayTime()! <= 500)
			.sort((a, b) => a.getDecayTime()! - b.getDecayTime()!);
		if (animalFatItemsDecayingSoon.length > 0) {
			return new AcquireItemWithRecipe(ItemType.Tallow, itemDescriptions[ItemType.Tallow].recipe!);
		}

		const offalItemsDecayingSoon = baseItemsWithDecay
			.filter(item => item.type === ItemType.Offal && item.getDecayTime()! <= 200)
			.sort((a, b) => a.getDecayTime()! - b.getDecayTime()!);
		if (offalItemsDecayingSoon.length > 0) {
			return new AcquireItemWithRecipe(ItemType.BoneGlue, itemDescriptions[ItemType.BoneGlue].recipe!);
		}

		return ObjectiveResult.Ignore;
	}

}
