import { ActionType } from "game/entity/action/IAction";
import type { IRecipe } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import type { IRequirementInfo } from "game/item/IItemManager";
import { RequirementStatus, WeightType } from "game/item/IItemManager";
import type Item from "game/item/Item";
import type ItemRecipeRequirementChecker from "game/item/ItemRecipeRequirementChecker";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import { ReserveType } from "../../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import MoveToTarget from "../../core/MoveToTarget";
import ReserveItems from "../../core/ReserveItems";
import MoveItem from "../../other/item/MoveItem";
import CompleteRequirements from "../../utility/CompleteRequirements";
import MoveToLand from "../../utility/moveTo/MoveToLand";
import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

export default class AcquireItemWithRecipe extends AcquireBase {

	constructor(private readonly itemType: ItemType, private readonly recipe: IRecipe, private readonly allowInventoryItems?: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemWithRecipe:${ItemType[this.itemType]}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} with a recipe`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const canCraftFromIntermediateChest = !this.recipe.requiresFire && !this.recipe.requiredDoodads;

		const requirementInfo = context.island.items.hasAdditionalRequirements(context.human, this.itemType);

		const checker = context.utilities.item.processRecipe(context, this.recipe, false, this.allowInventoryItems);
		const checkerWithIntermediateChest = context.utilities.item.processRecipe(context, this.recipe, true, this.allowInventoryItems);

		const availableInventoryWeight = context.utilities.item.getAvailableInventoryWeight(context);
		const estimatedItemWeight = context.island.items.getWeight(this.itemType, WeightType.Static);

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
			// todo: always make this true?
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
				const reserveType = requires[i].consumedAmount === 0 ? ReserveType.Soft : ReserveType.Hard;
				objectives.push(new ReserveItems(...itemsForComponent).setReserveType(reserveType));
			}
		}

		if (!requirementsMet) {
			if (this.recipe.baseComponent !== undefined && !itemBase) {
				this.log.info(`Missing base component ${context.island.items.isGroup(this.recipe.baseComponent) ? ItemTypeGroup[this.recipe.baseComponent] : ItemType[this.recipe.baseComponent]}`);

				if (context.island.items.isGroup(this.recipe.baseComponent)) {
					objectives.push(new AcquireItemByGroup(this.recipe.baseComponent).passAcquireData(this, ReserveType.Hard));

				} else {
					objectives.push(new AcquireItem(this.recipe.baseComponent).passAcquireData(this, ReserveType.Hard));
				}
			}

			const requires = this.recipe.components;
			for (let i = 0; i < requires.length; i++) {
				const missingAmount = checker.amountNeededForComponent(i);
				if (missingAmount > 0) {
					const recipeComponent = requires[i];
					const componentType = recipeComponent.type;
					const reserveType = recipeComponent.consumedAmount === 0 ? ReserveType.Soft : ReserveType.Hard;

					this.log.info(`Missing component ${context.island.items.isGroup(componentType) ? ItemTypeGroup[componentType] : ItemType[componentType]} x${missingAmount}`);

					for (let j = 0; j < missingAmount; j++) {
						if (context.island.items.isGroup(componentType)) {
							objectives.push(new AcquireItemByGroup(componentType).passAcquireData(this, reserveType));

						} else {
							objectives.push(new AcquireItem(componentType).passAcquireData(this, reserveType));
						}
					}
				}
			}
		}

		objectives.push(new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false));

		if (checkerWithoutIntermediateChest) {
			// check if we need items in our intermediate container
			const intermediateChest = context.base.intermediateChest[0];
			if (intermediateChest && !checkerWithoutIntermediateChest.requirementsMet()) {
				// move to our container before crafting
				objectives.push(new MoveToTarget(intermediateChest, true));

				if (!canCraftFromIntermediateChest) {
					// move all the items we need from the chest

					const moveIfInIntermediateChest = (item: Item | undefined) => {
						if (item) {
							if (context.island.items.isContainableInContainer(item, intermediateChest)) {
								objectives.push(new MoveItem(item, context.human.inventory, intermediateChest));
							}
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
			action.execute(context.actionExecutor, this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent);
		}).passAcquireData(this).setStatus(() => `Crafting ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

		return objectives;
	}

}
