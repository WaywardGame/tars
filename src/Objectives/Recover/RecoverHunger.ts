import { ActionType } from "entity/action/IAction";
import { IStatMax, Stat } from "entity/IStats";
import Item from "item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { foodItemTypes, getInventoryItemsWithUse } from "../../Utilities/Item";
import AcquireFood from "../Acquire/Item/AcquireFood";
import UseItem from "../Other/UseItem";

export default class RecoverHunger extends Objective {

	constructor(private readonly exceededThreshold: boolean) {
		super();
	}

	public getIdentifier(): string {
		return "RecoverHunger";
	}

	public getStatus(): string {
		return "Recovering hunger";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hunger = context.player.stat.get<IStatMax>(Stat.Hunger);

		if (!this.exceededThreshold) {
			// if there's more food to cook and we're not at max, we should cook
			if ((hunger.value / hunger.max) < 0.9) {
				if (isNearBase(context)) {
					// only make food if theres not enough
					const availableFoodItems = this.getFoodItemsInBase(context).concat(this.getFoodItemsInInventory(context));
					if (availableFoodItems.length < 10) {
						const foodRecipeObjectivePipelines = AcquireFood.getFoodRecipeObjectivePipelines(context, false);
						if (foodRecipeObjectivePipelines.length > 0) {
							return foodRecipeObjectivePipelines;
						}
					}
				}

				const decayingSoonFoodItems = this.getFoodItemsInInventory(context).filter(item => item.decay === undefined || item.decay < 10);
				if (decayingSoonFoodItems.length > 0) {
					this.log.info(`Eating ${decayingSoonFoodItems[0].getName(false).getString()} since it's decaying soon (${decayingSoonFoodItems[0].decay})`);
					return new UseItem(ActionType.Eat, decayingSoonFoodItems[0]);
				}
			}

			return ObjectiveResult.Ignore;
		}

		const isEmergency = hunger.value < 0;

		let foodItems = this.getFoodItemsInInventory(context);

		if (isEmergency && foodItems.length === 0) {
			foodItems = getInventoryItemsWithUse(context, ActionType.Eat);
		}

		if (foodItems.length > 0) {
			this.log.info(`Eating ${foodItems[0].getName(false).getString()}`);
			return new UseItem(ActionType.Eat, foodItems[0]);
		}

		return [
			new AcquireFood(isEmergency),
			new UseItem(ActionType.Eat),
		];
	}

	private getFoodItemsInInventory(context: Context) {
		const items: Item[] = [];

		for (const itemType of foodItemTypes) {
			items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemType, true));
		}

		return items
			.sort((a, b) => {
				const decayA = a.decay !== undefined ? a.decay : 999999;
				const decayB = b.decay !== undefined ? b.decay : 999999;
				return decayA > decayB ? 1 : -1;
			});
	}

	private getFoodItemsInBase(context: Context) {
		const items: Item[] = [];

		for (const chest of context.base.chest) {
			items.push(...itemManager.getItemsInContainer(chest, true).filter(item => foodItemTypes.has(item.type)));
		}

		return items
			.sort((a, b) => {
				const decayA = a.decay !== undefined ? a.decay : 999999;
				const decayB = b.decay !== undefined ? b.decay : 999999;
				return decayA > decayB ? 1 : -1;
			});
	}
}
