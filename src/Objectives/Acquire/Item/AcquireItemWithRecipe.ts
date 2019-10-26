import { ActionType } from "entity/action/IAction";
import { IRecipe, ItemType, ItemTypeGroup } from "item/IItem";
import { RequirementInfo, WeightType } from "item/IItemManager";
import Item from "item/Item";
import ItemRecipeRequirementChecker from "item/ItemRecipeRequirementChecker";

import Context, { ContextDataType } from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { getAvailableInventoryWeight, processRecipe } from "../../../Utilities/Item";
import SetContextData from "../../ContextData/SetContextData";
import ExecuteAction from "../../Core/ExecuteAction";
import ExecuteActionForItem, { ExecuteActionType } from "../../Core/ExecuteActionForItem";
import MoveToTarget from "../../Core/MoveToTarget";
import ReserveItems from "../../Core/ReserveItems";
import CompleteRecipeRequirements from "../../Utility/CompleteRecipeRequirements";
import MoveToLand from "../../Utility/MoveToLand";

import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

export default class AcquireItemWithRecipe extends Objective {

	constructor(private readonly itemType: ItemType, private readonly recipe: IRecipe) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemWithRecipe:${ItemType[this.itemType]}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const canCraftFromIntermediateChest = !this.recipe.requiresFire && !this.recipe.requiredDoodad;

		const requirementInfo = itemManager.hasAdditionalRequirements(context.player, this.itemType);

		const checker = processRecipe(context, this.recipe, false);
		const checkerWithIntermediateChest = processRecipe(context, this.recipe, true);

		const availableInventoryWeight = getAvailableInventoryWeight(context);
		const estimatedItemWeight = itemManager.getWeight(this.itemType, WeightType.Static);

		const mustUseIntermediateChest = availableInventoryWeight < estimatedItemWeight;
		if (mustUseIntermediateChest) {
			// we have to use the intermediate chest for this recipe - we cannot store all the materials in our inventory
			this.log.info(`Must use intermediate chest. Available inventory weight: ${availableInventoryWeight}. Estimated item weight: ${estimatedItemWeight}.`);

			return [
				this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, true, checkerWithIntermediateChest, checker),
			];
		}

		// create objective pipelines for normal crafting, and with intermediate chest crafting
		// it's possible not using the chest is easier
		return [
			this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, false, checker),
			this.getObjectives(context, requirementInfo, canCraftFromIntermediateChest, false, checkerWithIntermediateChest, checker),
		];
	}

	private getObjectives(
		context: Context,
		requirementInfo: RequirementInfo,
		canCraftFromIntermediateChest: boolean,
		allowOrganizingItemsIntoIntermediateChest: boolean,
		checker: ItemRecipeRequirementChecker,
		checkerWithoutIntermediateChest?: ItemRecipeRequirementChecker): IObjective[] {
		const objectives: IObjective[] = [
			new SetContextData(ContextDataType.CanCraftFromIntermediateChest, canCraftFromIntermediateChest),
			new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, allowOrganizingItemsIntoIntermediateChest),
			new SetContextData(ContextDataType.NextActionAllowsIntermediateChest, checkerWithoutIntermediateChest ? true : false),
		];

		const requirementsMet = checker.requirementsMet();

		const itemBase = checker.itemBaseComponent;
		if (itemBase) {
			objectives.push(new ReserveItems(itemBase));
		}

		const requires = this.recipe.components;
		for (let i = 0; i < requires.length; i++) {
			const itemsForComponent = checker.getItemsForComponent(i);
			if (itemsForComponent.length > 0) {
				objectives.push(new ReserveItems(...itemsForComponent));
			}
		}

		if (!requirementsMet) {
			if (this.recipe.baseComponent !== undefined && !itemBase) {
				this.log.info(`Need base component ${itemManager.isGroup(this.recipe.baseComponent) ? ItemTypeGroup[this.recipe.baseComponent] : ItemType[this.recipe.baseComponent]}`);

				if (itemManager.isGroup(this.recipe.baseComponent)) {
					objectives.push(new AcquireItemByGroup(this.recipe.baseComponent));

				} else {
					objectives.push(new AcquireItem(this.recipe.baseComponent));
				}
			}

			const requires = this.recipe.components;
			for (let i = 0; i < requires.length; i++) {
				const missingAmount = checker.amountNeededForComponent(i);
				if (missingAmount > 0) {
					const componentType = requires[i].type;

					this.log.info(`Need component. ${itemManager.isGroup(componentType) ? ItemTypeGroup[componentType] : ItemType[componentType]} x${missingAmount}`);

					for (let j = 0; j < missingAmount; j++) {
						if (itemManager.isGroup(componentType)) {
							objectives.push(new AcquireItemByGroup(componentType));

						} else {
							objectives.push(new AcquireItem(componentType));
						}
					}
				}
			}
		}

		objectives.push(new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));

		if (checkerWithoutIntermediateChest && context.base.intermediateChest[0]) {
			// check if we need items in our intermediate container
			if (!checkerWithoutIntermediateChest.requirementsMet()) {
				// move to our container before crafting
				objectives.push(new MoveToTarget(context.base.intermediateChest[0], true));

				if (!canCraftFromIntermediateChest) {
					// move all the items we need from the chest

					const moveIfInIntermediateChest = (item: Item | undefined) => {
						if (item && item.containedWithin === context.base.intermediateChest[0]) {
							objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
								action.execute(context.player, item, undefined, context.player.inventory);
							}));
						}
					};

					moveIfInIntermediateChest(checker.itemBaseComponent);

					for (const item of checker.itemComponentsConsumed) {
						moveIfInIntermediateChest(item);
					}

					for (const item of checker.itemComponentsRequired) {
						moveIfInIntermediateChest(item);
					}
				}
			}
		}

		if (!requirementInfo.requirementsMet) {
			objectives.push(new CompleteRecipeRequirements(this.recipe));

		} else {
			objectives.push(new MoveToLand());
		}

		objectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [this.itemType], ActionType.Craft, (context, action) => {
			action.execute(context.player, this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent);
		}));

		return objectives;
	}

}
