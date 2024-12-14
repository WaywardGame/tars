import type { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import Craft from "@wayward/game/game/entity/action/actions/Craft";
import type { IContainer, IRecipe } from "@wayward/game/game/item/IItem";
import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import type { IRequirementInfo } from "@wayward/game/game/item/IItemManager";
import { WeightType } from "@wayward/game/game/item/IItemManager";
import type Item from "@wayward/game/game/item/Item";
import type ItemRecipeRequirementChecker from "@wayward/game/game/item/ItemRecipeRequirementChecker";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";

import Message from "@wayward/game/language/dictionary/Message";
import { ReserveType } from "../../../core/ITars";
import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import type { IGetItemOptions } from "../../../utilities/ItemUtilities";
import { ItemUtilities, RelatedItemType } from "../../../utilities/ItemUtilities";
import SetContextData from "../../contextData/SetContextData";
import AddDifficulty from "../../core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import MoveToTarget from "../../core/MoveToTarget";
import ReserveItems from "../../core/ReserveItems";
import MoveItemsIntoInventory from "../../other/item/MoveItemsIntoInventory";
import CompleteRequirements from "../../utility/CompleteRequirements";
import MoveToLand from "../../utility/moveTo/MoveToLand";
import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

// TARS recomputes and fixes itself when this happens
const expectedCraftMessages = new Set<Message>([Message.ActionCraftYouLackTheRequirements]);

export default class AcquireItemWithRecipe extends AcquireBase {

	private readonly recipeRequiresBaseDoodads: boolean;

	constructor(private readonly itemType: ItemType, private readonly recipe: IRecipe, private readonly allowInventoryItems?: boolean) {
		super();

		this.recipeRequiresBaseDoodads = this.recipe.requiresFire === true || this.recipe.requiredDoodads !== undefined;
	}

	public getIdentifier(): string {
		return `AcquireItemWithRecipe:${ItemType[this.itemType]}`;
		// return `AcquireItemWithRecipe:${ItemType[this.itemType]}:${context?.getData(ContextDataType.PrioritizeBaseChests)}:${context?.getData(ContextDataType.NextActionAllowsIntermediateChest)}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} with a recipe`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.Recipe);
	}

	public override shouldIncludeContextHashCode(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const requirementInfo = context.island.items.hasAdditionalRequirements(context.human, this.itemType);

		const options: Partial<IGetItemOptions> = { allowInventoryItems: !!this.allowInventoryItems, allowUnsafeWaterContainers: true };
		const checker = context.utilities.item.processRecipe(context, this.recipe, false, options);
		const checkerWithIntermediateChest = context.utilities.item.processRecipe(context, this.recipe, true, options);

		const availableInventoryWeight = context.utilities.item.getAvailableInventoryWeight(context);
		const estimatedItemWeight = context.island.items.getWeight(this.itemType, WeightType.Static);

		const mustUseIntermediateChest = availableInventoryWeight < estimatedItemWeight;
		if (mustUseIntermediateChest) {
			// we have to use the intermediate chest for this recipe - we cannot store all the materials in our inventory
			this.log.info(`Must use intermediate chest. Available inventory weight: ${availableInventoryWeight}. Estimated item weight: ${estimatedItemWeight}.`);

			return [
				this.getObjectives(context, requirementInfo, true, checkerWithIntermediateChest, checker),
			];
		}

		// create objective pipelines for normal crafting, and with intermediate chest crafting
		// it's possible not using the chest is easier
		return [
			this.getObjectives(context, requirementInfo, false, checker),
			this.getObjectives(context, requirementInfo, false, checkerWithIntermediateChest, checker),
		];
	}

	private getObjectives(
		context: Context,
		requirementInfo: IRequirementInfo,
		allowOrganizingItemsIntoIntermediateChest: boolean,
		checker: ItemRecipeRequirementChecker,
		checkerWithoutIntermediateChest?: ItemRecipeRequirementChecker): IObjective[] {
		const objectives: IObjective[] = [
			new SetContextData(ContextDataType.CanCraftFromIntermediateChest, this.recipeRequiresBaseDoodads),
			new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, allowOrganizingItemsIntoIntermediateChest),
			new SetContextData(ContextDataType.NextActionAllowsIntermediateChest, checkerWithoutIntermediateChest ? true : false),
		];

		if (this.recipeRequiresBaseDoodads) {
			// we have to go back to the base at some point
			// prioritize items available at the base
			// note: we are never setting this to false. because the top down tree matters
			objectives.push(new SetContextData(ContextDataType.PrioritizeBaseItems, true));
		}

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

				if (this.recipeRequiresBaseDoodads) {
					// move all the items we need from the chest

					const moveIfInIntermediateChest = (item: Item | undefined) => {
						if (item) {
							if (context.island.items.isContainableInContainer(item, intermediateChest as IContainer)) {
								objectives.push(new MoveItemsIntoInventory(item, intermediateChest.tile));
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

		if (this.recipe.level !== 0) {
			// breaks ties between Wooden and Ornate Wooden chests
			objectives.push(new AddDifficulty(this.recipe.level));
		}

		objectives.push(
			new CompleteRequirements(requirementInfo),
			new MoveToLand(),
			new ExecuteActionForItem(
				ExecuteActionType.Generic,
				[this.itemType],
				{
					genericAction: {
						action: Craft,
						args: () => {
							// todo: actually pass in the right items here?
							// checker might just have empty items here
							// const options: Partial<IGetItemOptions> = {
							// 	allowInventoryItems: !!this.allowInventoryItems,
							// 	allowUnsafeWaterContainers: true,
							// 	onlyAllowReservedItems: true,
							// };
							// const checker = checkerWithoutIntermediateChest ?
							// 	context.utilities.item.processRecipe(context, this.recipe, true, options) :
							// 	context.utilities.item.processRecipe(context, this.recipe, false, options);

							return [this.itemType, checker.itemComponentsRequired, checker.itemComponentsConsumed, checker.itemBaseComponent] as ActionArgumentsOf<typeof Craft>;
						},
						expectedMessages: expectedCraftMessages,
					},
					preRetry: () => {
						const items = [
							...checker.itemComponentsRequired,
							...checker.itemComponentsConsumed,
							checker.itemBaseComponent,
						];
						for (const item of items) {
							if (item?.isValid) {
								// we failed to craft and one of our items broke
								// restart instead of trying to craft again
								return ObjectiveResult.Restart;
							}
						}
					},
				})
				.passAcquireData(this)
				.setStatus(() => `Crafting ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

		return objectives;
	}

}
