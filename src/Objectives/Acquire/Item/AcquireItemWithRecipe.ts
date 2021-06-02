import { ActionType } from "game/entity/action/IAction";
import { IRecipe, ItemType, ItemTypeGroup } from "game/item/IItem";
import { IRequirementInfo, RequirementStatus, WeightType } from "game/item/IItemManager";
import Item from "game/item/Item";
import ItemRecipeRequirementChecker from "game/item/ItemRecipeRequirementChecker";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import { itemUtilities } from "../../../utilities/Item";
import SetContextData from "../../contextData/SetContextData";
import ExecuteAction from "../../core/ExecuteAction";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import MoveToTarget from "../../core/MoveToTarget";
import ReserveItems from "../../core/ReserveItems";
import CompleteRequirements from "../../utility/CompleteRequirements";
import MoveToLand from "../../utility/MoveToLand";

import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

export default class AcquireItemWithRecipe extends AcquireBase {

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
		const canCraftFromIntermediateChest = !this.recipe.requiresFire && !this.recipe.requiredDoodads;

		const requirementInfo = itemManager.hasAdditionalRequirements(context.player, this.itemType);

		const checker = itemUtilities.processRecipe(context, this.recipe, false);
		const checkerWithIntermediateChest = itemUtilities.processRecipe(context, this.recipe, true);

		const availableInventoryWeight = itemUtilities.getAvailableInventoryWeight(context);
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
		requirementInfo: IRequirementInfo,
		canCraftFromIntermediateChest: boolean,
		allowOrganizingItemsIntoIntermediateChest: boolean,
		checker: ItemRecipeRequirementChecker,
		checkerWithoutIntermediateChest?: ItemRecipeRequirementChecker): IObjective[] {
		const objectives: IObjective[] = [
			new SetContextData(ContextDataType.PrioritizeBaseChests, canCraftFromIntermediateChest),
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
				this.log.info(`Missing base component ${itemManager.isGroup(this.recipe.baseComponent) ? ItemTypeGroup[this.recipe.baseComponent] : ItemType[this.recipe.baseComponent]}`);

				if (itemManager.isGroup(this.recipe.baseComponent)) {
					objectives.push(new AcquireItemByGroup(this.recipe.baseComponent).passContextDataKey(this));

				} else {
					objectives.push(new AcquireItem(this.recipe.baseComponent).passContextDataKey(this));
				}
			}

			const requires = this.recipe.components;
			for (let i = 0; i < requires.length; i++) {
				const missingAmount = checker.amountNeededForComponent(i);
				if (missingAmount > 0) {
					const componentType = requires[i].type;

					this.log.info(`Missing component ${itemManager.isGroup(componentType) ? ItemTypeGroup[componentType] : ItemType[componentType]} x${missingAmount}`);

					for (let j = 0; j < missingAmount; j++) {
						if (itemManager.isGroup(componentType)) {
							objectives.push(new AcquireItemByGroup(componentType).passContextDataKey(this));

						} else {
							objectives.push(new AcquireItem(componentType).passContextDataKey(this));
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
								action.execute(context.player, item, context.player.inventory);
							}).setStatus(() => `Moving ${item.getName()} to inventory`));
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

		if (requirementInfo.requirements === RequirementStatus.Missing) {
			objectives.push(new CompleteRequirements(requirementInfo));

		} else {
			objectives.push(new MoveToLand());
		}

		objectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [this.itemType], ActionType.Craft, (context, action) => {
			action.execute(context.player, this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent);
		}).passContextDataKey(this).setStatus(() => `Crafting ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

		return objectives;
	}

}
