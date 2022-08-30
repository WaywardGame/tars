import { ActionType } from "game/entity/action/IAction";
import type { IContainer } from "game/item/IItem";
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
				objectivePipelines.push([
					new AcquireItem(itemType).passAcquireData(this),
				]);
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
				if (eatFood) {
					objectivePipelines.push([
						new AcquireItemWithRecipe(itemType, recipe).keepInInventory(),
						new UseItem(Eat),
					]);

				} else {
					objectivePipelines.push([
						new AcquireItemWithRecipe(itemType, recipe)
					]);
				}
			}
		}

		return objectivePipelines;
	}

}
