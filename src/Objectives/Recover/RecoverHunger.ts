import { ActionType } from "entity/action/IAction";
import { IStatMax, Stat } from "entity/IStats";
import { IContainer, ItemType, ItemTypeGroup } from "item/IItem";
import Item from "item/Item";
import itemDescriptions, { itemDescriptions as Items } from "item/Items";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { hasBase, isNearBase } from "../../Utilities/Base";
import { getInventoryItemsWithUse, processRecipe } from "../../Utilities/Item";
import AcquireItem from "../Acquire/Item/AcquireItem";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import AcquireItemWithRecipe from "../Acquire/Item/AcquireItemWithRecipe";
import SetContextData from "../ContextData/SetContextData";
import UseItem from "../Other/UseItem";

// items that can cause poisoning when eaten will be filtered out
const goodFoodItems = [ItemTypeGroup.Vegetable, ItemTypeGroup.Fruit, ItemTypeGroup.Bait, ItemTypeGroup.CookedFood, ItemTypeGroup.CookedMeat, ItemTypeGroup.Seed];

export default class RecoverHunger extends Objective {

	private static readonly foodItemTypes: ItemType[] = RecoverHunger.getFoodItemTypes();

	constructor(private readonly exceededThreshold: boolean) {
		super();
	}

	public getIdentifier(): string {
		return "RecoverHunger";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);

		if (!this.exceededThreshold) {
			// if there's more food to cook and we're not at max, we should cook
			if ((hunger.value / hunger.max) < 0.9) {
				if (hasBase(context) && isNearBase(context)) {
					const foodRecipeObjectivePipelines = this.getFoodRecipeObjectivePipelines(context, false);
					if (foodRecipeObjectivePipelines.length > 0) {
						return foodRecipeObjectivePipelines;
					}
				}

				const foodItems = this.getFoodItems(context);
				if (foodItems.length > 0) {
					this.log.info(`Eating ${foodItems[0].getName(false).getString()}`);
					return new UseItem(ActionType.Eat, foodItems[0]);
				}
			}

			return ObjectiveResult.Ignore;
		}

		const isEmergency = hunger.value < 0;

		let foodItems = this.getFoodItems(context);

		if (isEmergency && foodItems.length === 0) {
			foodItems = getInventoryItemsWithUse(context, ActionType.Eat);
		}

		if (foodItems.length > 0) {
			this.log.info(`Eating ${foodItems[0].getName(false).getString()}`);
			return new UseItem(ActionType.Eat, foodItems[0]);
		}

		// check if we can craft food based on our current items
		const objectivePipelines: IObjective[][] = [];

		objectivePipelines.push(...this.getFoodRecipeObjectivePipelines(context, true));

		for (const itemType of RecoverHunger.foodItemTypes) {
			objectivePipelines.push([
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new AcquireItem(itemType),
				new UseItem(ActionType.Eat),
			]);
		}

		if (isEmergency) {
			// make this harder since it could result in poison
			objectivePipelines.push([
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new AcquireItemForAction(ActionType.Eat).addDifficulty(100),
				new UseItem(ActionType.Eat),
			]);
		}

		return objectivePipelines;
	}

	private getFoodRecipeObjectivePipelines(context: Context, eatFood: boolean) {
		const objectivePipelines: IObjective[][] = [];

		for (const itemType of RecoverHunger.foodItemTypes) {
			const description = Items[itemType];
			if (!description || description.craftable === false) {
				continue;
			}

			const recipe = description.recipe;
			if (!recipe) {
				continue;
			}

			const checker = processRecipe(context, recipe, true);

			for (const chest of context.base.chest) {
				checker.processContainer(chest as IContainer);
			}

			if (checker.requirementsMet()) {
				const objectives: IObjective[] = [
					new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
					new AcquireItemWithRecipe(itemType, recipe),
				];

				if (eatFood) {
					objectives.push(new UseItem(ActionType.Eat));
				}

				objectivePipelines.push(objectives);
			}
		}

		return objectivePipelines;
	}

	private getFoodItems(context: Context) {
		const items: Item[] = [];

		for (const itemType of RecoverHunger.foodItemTypes) {
			items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType, true));
		}

		return items
			.sort((a, b) => {
				const decayA = a.decay !== undefined ? a.decay : 999999;
				const decayB = b.decay !== undefined ? b.decay : 999999;
				return decayA > decayB ? 1 : -1;
			});
	}

	private static getFoodItemTypes() {
		const result: ItemType[] = [];

		for (const itemTypeOrGroup of goodFoodItems) {
			const itemTypes = itemManager.isGroup(itemTypeOrGroup) ? itemManager.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
			for (const itemType of itemTypes) {
				const description = itemDescriptions[itemType];
				if (description) {
					const onUse = description.onUse;
					if (onUse) {
						const onEat = onUse[ActionType.Eat];
						if (onEat) {
							if (onEat[0] > 1) {
								result.push(itemType);
							}
						}
					}
				}
			}
		}

		return result;
	}
}
