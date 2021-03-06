import { ActionType } from "game/entity/action/IAction";
import { IStatMax, Stat } from "game/entity/IStats";
import Item from "game/item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { baseUtilities } from "../../utilities/Base";
import { itemUtilities } from "../../utilities/Item";
import AcquireFood from "../acquire/item/AcquireFood";
import ReserveItems from "../core/ReserveItems";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import UseItem from "../other/item/UseItem";

const decayingSoonThreshold = 50;

export default class RecoverHunger extends Objective {

	constructor(private readonly onlyUseAvailableItems: boolean, private readonly exceededThreshold: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `RecoverHunger:${this.onlyUseAvailableItems}`;
	}

	public getStatus(): string {
		return "Recovering hunger";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);

		if (this.onlyUseAvailableItems) {
			const foodItems = this.exceededThreshold ? this.getFoodItemsInInventory(context) : undefined;
			return foodItems?.[0] ? this.eatItem(context, foodItems[0]) : ObjectiveResult.Ignore;
		}

		if (!this.exceededThreshold) {
			// if there's more food to cook and we're not at max, we should cook
			if ((hunger.value / hunger.max) < 0.9) {
				let decayingSoonFoodItems: Item[] = [];

				if (baseUtilities.isNearBase(context)) {
					// only make food if theres not enough
					const foodItemsInBase = this.getFoodItemsInBase(context);

					const availableFoodItems = foodItemsInBase.concat(this.getFoodItemsInInventory(context));
					if (availableFoodItems.length < 10) {
						const foodRecipeObjectivePipelines = AcquireFood.getFoodRecipeObjectivePipelines(context, false);
						if (foodRecipeObjectivePipelines.length > 0) {
							return foodRecipeObjectivePipelines;
						}
					}

					decayingSoonFoodItems = decayingSoonFoodItems.concat(foodItemsInBase.filter(item => item.decay === undefined || item.decay <= decayingSoonThreshold));
				}

				decayingSoonFoodItems = decayingSoonFoodItems.concat(this.getFoodItemsInInventory(context).filter(item => item.decay === undefined || item.decay <= decayingSoonThreshold));

				if (decayingSoonFoodItems.length > 0) {
					return this.eatItem(context, decayingSoonFoodItems[0]);
				}
			}

			return ObjectiveResult.Ignore;
		}

		const isEmergency = hunger.value < 0;

		let foodItems: Item[] = [];

		// prefer eating food that was prepared ahead of time if we're near our base
		if (baseUtilities.isNearBase(context)) {
			foodItems = this.getFoodItemsInBase(context);
		}

		if (foodItems.length === 0) {
			foodItems = this.getFoodItemsInInventory(context);

			if (isEmergency && foodItems.length === 0) {
				foodItems = itemUtilities.getInventoryItemsWithUse(context, ActionType.Eat);
			}
		}

		if (foodItems.length > 0) {
			return this.eatItem(context, foodItems[0]);
		}

		return [
			new AcquireFood(isEmergency),
			new UseItem(ActionType.Eat),
		];
	}

	private getFoodItemsInInventory(context: Context) {
		// prioritize ones that will decay sooner
		return Array.from(itemUtilities.foodItemTypes)
			.map(foodItemType => itemManager.getItemsInContainerByType(context.player.inventory, foodItemType, true))
			.flat()
			.sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
	}

	private getFoodItemsInBase(context: Context): Item[] {
		// prioritize ones that will decay sooner
		return context.base.chest
			.map(chest => itemManager.getItemsInContainer(chest, true)
				.filter(item => itemUtilities.foodItemTypes.has(item.type)))
			.flat()
			.sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
	}

	private eatItem(context: Context, item: Item) {
		this.log.info(`Eating ${item.getName(false).getString()}`);
		return [new ReserveItems(item), new MoveItemIntoInventory(item), new UseItem(ActionType.Eat, item)];
	}
}
