import { ActionType } from "game/entity/action/IAction";
import type { IContainer } from "game/item/IItem";
import itemDescriptions from "game/item/Items";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import SetContextData from "../../../objectives/contextData/SetContextData";
import UseItem from "../../other/item/UseItem";

import AcquireItem from "./AcquireItem";
import AcquireItemForAction from "./AcquireItemForAction";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";

export default class AcquireFood extends Objective {

	constructor(private readonly allowDangerousFoodItems: boolean = false) {
		super();
	}

	public getIdentifier(): string {
		return "AcquireFood";
	}

	public getStatus(): string | undefined {
		return "Acquiring food";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		// check if we can craft food based on our current items
		objectivePipelines.push(...AcquireFood.getFoodRecipeObjectivePipelines(context, false));

		for (const itemType of context.utilities.item.foodItemTypes) {
			objectivePipelines.push([
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new AcquireItem(itemType).passAcquireData(this),
			]);
		}

		if (this.allowDangerousFoodItems) {
			// make this harder since it could result in poison
			objectivePipelines.push([
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new AcquireItemForAction(ActionType.Eat).passAcquireData(this).addDifficulty(100),
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

}
