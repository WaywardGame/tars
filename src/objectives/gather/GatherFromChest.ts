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

import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { IContainer } from "@wayward/game/game/item/IItem";
import { ItemType } from "@wayward/game/game/item/IItem";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
import SetContextData from "../contextData/SetContextData";
import ReserveItems from "../core/ReserveItems";
import MoveItemsIntoInventory from "../other/item/MoveItemsIntoInventory";

export default class GatherFromChest extends Objective {

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IGatherItemOptions> = {}) {
		super();
	}

	public getIdentifier(context: Context | undefined): string {
		return `GatherFromChest:${ItemType[this.itemType]}:${context?.getData(ContextDataType.PrioritizeBaseItems)}:${context?.getData(ContextDataType.NextActionAllowsIntermediateChest)}`;
	}

	public getStatus(): string | undefined {
		return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from a chest`;
	}

	public override canIncludeContextHashCode(context: Context, objectiveHashCode: string): { objectiveHashCode: string; itemTypes: Set<ItemType>; } {
		return {
			objectiveHashCode,
			itemTypes: new Set([this.itemType]),
		};
	}

	public override shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean {
		// it should cache this pipeline based on the reserved items by other GatherFromChest pipelines
		// example: why should this care about Sandstones that were gathered from a ground? gathering from tiles won't affect the caching for this objective
		return context.isReservedItemType(this.itemType, objectiveHashCode);
	}

	// we can't group this together because gatherfromchest objectives are prioritized to be ran last
	// public canGroupTogether(): boolean {
	// 	return true;
	// }

	// todo: add getWeightChange(): number and take that into account when grouping together?

	public async execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult> {
		const prioritizeBaseItems = context.getData(ContextDataType.PrioritizeBaseItems);

		let chests: Doodad[] = context.base.chest;

		if (!context.getData(ContextDataType.NextActionAllowsIntermediateChest)) {
			// the intermediate chest cannot be used for the recipe
			// allow using gathering items from it
			chests = chests.concat(context.base.intermediateChest);
		}

		return chests
			.map(chest => {
				const items = context.utilities.item.getItemsInContainerByType(context, chest as IContainer, this.itemType)
					.filter(item => {
						if (context.isHardReservedItem(item)) {
							return false;
						}

						if (this.options.requiredMinDur !== undefined && (item.durability === undefined || item.durability < this.options.requiredMinDur)) {
							return false;
						}

						if (this.options.requirePlayerCreatedIfCraftable) {
							const canCraft = item.description?.recipe;
							if (canCraft && !item.crafterIdentifier) {
								return false;
							}
						}

						if (this.options.willDestroyItem && !context.utilities.item.canDestroyItem(context, item)) {
							return false;
						}

						return true;
					});
				if (items.length > 0) {
					const item = items[0];
					return [
						new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
						new SetContextData(this.contextDataKey, item),
						new MoveItemsIntoInventory(item).overrideDifficulty(prioritizeBaseItems ? 5 : undefined),
					];
				}

				return undefined;
			})
			.filter(objectives => objectives !== undefined) as IObjective[][];
	}
}
