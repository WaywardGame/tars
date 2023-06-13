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

import { ActionType } from "game/entity/action/IAction";
import { IContainer, ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/ItemDescriptions";
import Eat from "game/entity/action/actions/Eat";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import UseItem from "../../other/item/UseItem";

import AcquireItem from "./AcquireItem";
import AcquireItemForAction from "./AcquireItemForAction";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";
import AddDifficulty from "../../core/AddDifficulty";
import MoveItemIntoInventory from "../../other/item/MoveItemIntoInventory";

export interface IAcquireFoodOptions {
	onlyAllowBaseItems: boolean;
	allowDangerousFoodItems: boolean;

}
export default class AcquireFood extends Objective {

	constructor(private readonly options?: Partial<IAcquireFoodOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireFood:${this.options?.onlyAllowBaseItems}:${this.options?.allowDangerousFoodItems}`;
	}

	public getStatus(): string | undefined {
		return "Acquiring food";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		// check if we can craft food based on our current items (inventory and base)
		objectivePipelines.push(...AcquireFood.getFoodRecipeObjectivePipelines(context, false));

		if (this.options?.onlyAllowBaseItems) {
			// check if we have existing food items in the base
			for (const item of context.utilities.item.getBaseItems(context)) {
				if (!context.island.items.isContainableInContainer(item, context.human.inventory)) {
					if (context.utilities.item.foodItemTypes.has(item.type)) {
						objectivePipelines.push([
							new MoveItemIntoInventory(item).passAcquireData(this),
						]);
					}
				}
			}

		} else {
			for (const itemType of context.utilities.item.foodItemTypes) {
				const objectivePipeline: IObjective[] = [];

				// prioritize the direct craft, like Raw Meat -> Cooked Meat
				const isUndesirable = itemType === ItemType.Pemmican;
				if (isUndesirable) {
					objectivePipeline.push(new AddDifficulty(500));
				}

				objectivePipeline.push(new AcquireItem(itemType).passAcquireData(this));

				objectivePipelines.push(objectivePipeline);
			}
		}

		if (this.options?.allowDangerousFoodItems) {
			objectivePipelines.push([
				new AddDifficulty(100), // make this harder since it could result in poison
				new AcquireItemForAction(ActionType.Eat).passAcquireData(this),
			]);
		}

		return objectivePipelines;
	}

	public static getFoodRecipeObjectivePipelines(context: Context, eatFood: boolean) {
		const objectivePipelines: IObjective[][] = [];

		for (const itemType of context.utilities.item.foodItemTypes) {
			if (itemType === ItemType.Pemmican) {
				// never try to make pemmican
				continue;
			}

			const description = itemDescriptions[itemType];
			if (!description || description.craftable === false) {
				continue;
			}

			const recipe = description.recipe;
			if (!recipe) {
				continue;
			}

			const checker = context.utilities.item.processRecipe(context, recipe, true);

			for (const chest of context.base.chest) {
				checker.processContainer(chest as IContainer);
			}

			if (checker.requirementsMet()) {
				const objectivePipeline: IObjective[] = [];

				if (eatFood) {
					objectivePipeline.push(
						new AcquireItemWithRecipe(itemType, recipe).keepInInventory(),
						new UseItem(Eat),
					);

				} else {
					objectivePipeline.push(new AcquireItemWithRecipe(itemType, recipe));
				}

				objectivePipelines.push(objectivePipeline)
			}
		}

		return objectivePipelines;
	}

}
