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
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Item from "game/item/Item";
import Eat from "game/entity/action/actions/Eat";
import { WeightStatus } from "game/entity/player/IPlayer";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireFood from "../acquire/item/AcquireFood";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";
import UseItem from "../other/item/UseItem";
import { IContainer } from "game/item/IItem";

const decayingSoonThreshold = 50;

export default class RecoverHunger extends Objective {

	constructor(private readonly onlyUseAvailableItems: boolean, private readonly exceededThreshold: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `RecoverHunger:${this.onlyUseAvailableItems}`;
	}

	public getStatus(): string | undefined {
		return "Recovering hunger";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hunger = context.human.stat.get<IStatMax>(Stat.Hunger);

		if (this.onlyUseAvailableItems) {
			const foodItems = this.exceededThreshold ? this.getFoodItemsInInventory(context) : undefined;
			return foodItems?.[0] ? this.eatItem(context, foodItems[0]) : ObjectiveResult.Ignore;
		}

		if (!this.exceededThreshold) {
			// if there's more food to cook and we're not at max, we should cook
			if ((hunger.value / hunger.max) < 0.9) {
				let decayingSoonFoodItems: Item[] = [];

				if (context.utilities.base.isNearBase(context) && context.human.getWeightStatus() === WeightStatus.None) {
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

		// prefer eating food that was prepared ahead of time if we're near our base and can spare the weight
		if (context.utilities.base.isNearBase(context) && context.human.getWeightStatus() === WeightStatus.None) {
			foodItems = this.getFoodItemsInBase(context);
		}

		if (foodItems.length === 0) {
			foodItems = this.getFoodItemsInInventory(context);

			if (isEmergency && foodItems.length === 0) {
				foodItems = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Eat);
			}
		}

		if (foodItems.length > 0) {
			return this.eatItem(context, foodItems[0]);
		}

		return [
			new AcquireFood({ allowDangerousFoodItems: isEmergency }).keepInInventory(),
			new UseItem(Eat),
		];
	}

	private getFoodItemsInInventory(context: Context) {
		// prioritize ones that will decay sooner
		return Array.from(context.utilities.item.foodItemTypes)
			.map(foodItemType => context.utilities.item.getItemsInContainerByType(context, context.human.inventory, foodItemType))
			.flat()
			.sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
	}

	private getFoodItemsInBase(context: Context): Item[] {
		// prioritize ones that will decay sooner
		return context.base.chest
			.map(chest => context.utilities.item.getItemsInContainer(context, chest as IContainer)
				.filter(item => context.utilities.item.foodItemTypes.has(item.type)))
			.flat()
			.sort((a, b) => (a.decay ?? 999999) - (b.decay ?? 999999));
	}

	private eatItem(context: Context, item: Item) {
		this.log.info(`Eating ${item.getName().getString()}`);
		return [
			new MoveItemIntoInventory(item).keepInInventory(),
			new UseItem(Eat, item),
		];
	}
}
