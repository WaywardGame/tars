import type Item from "game/item/Item";

import type Context from "../../core/context/Context";
import { IInventoryItems, IInventoryItemInfo } from "../../core/ITars";
import { inventoryItemInfo, InventoryItemFlag } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

export default class AnalyzeInventory extends Objective {

	public getIdentifier(): string {
		return "AnalyzeInventory";
	}

	public getStatus(): string | undefined {
		return "Analyzing inventory";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		const keys = Object.keys(inventoryItemInfo) as Array<keyof IInventoryItems>;
		for (const key of keys) {
			const itemInfo = inventoryItemInfo[key];
			const itemOrItems = context.inventory[key];

			if (itemOrItems !== undefined) {
				let invalidate = false;

				if (Array.isArray(itemOrItems)) {
					const validItems = itemOrItems.filter(item => this.isValid(context, itemInfo, item));

					if (itemOrItems.length !== validItems.length) {
						if (validItems.length > 0) {
							this.log.info(`"${key}" changed from ${itemOrItems.map(item => item).join(", ")} to ${validItems.map(item => item).join(", ")}`);
							context.inventory[key] = validItems as any;

						} else {
							invalidate = true;
						}
					}

				} else if (!this.isValid(context, itemInfo, itemOrItems)) {
					invalidate = true;
				}

				if (invalidate) {
					context.inventory[key] = undefined;
					this.log.info(`"${key}" was removed`);
				}
			}

			const flags = itemInfo.flags ?? InventoryItemFlag.PreferHigherWorth;

			// use a set to prevent duplicates
			const items = AnalyzeInventory.getItems(context, itemInfo);

			if (items.size > 0) {
				const flag = typeof (flags) === "object" ? flags.flag : flags;
				const flagOption = typeof (flags) === "object" ? flags.option : undefined;

				const sortedItems = Array.from(items).sort((itemA, itemB) => {
					const descriptionA = itemA.description();
					const descriptionB = itemB.description();

					if (!descriptionA || !descriptionB) {
						return -1;
					}

					switch (flag) {
						case InventoryItemFlag.PreferHigherWorth:
							return (descriptionB.worth ?? 0) - (descriptionA.worth ?? 0);

						case InventoryItemFlag.PreferHigherActionBonus:
							return itemB.getItemUseBonus(flagOption) - itemA.getItemUseBonus(flagOption);

						case InventoryItemFlag.PreferHigherTier:
							return (descriptionB.tier?.[flagOption] ?? 0) - (descriptionA.tier?.[flagOption] ?? 0);

						case InventoryItemFlag.PreferHigherDurability:
							return (itemB.minDur ?? 999999) - (itemA.minDur ?? 999999);

						case InventoryItemFlag.PreferHigherDecay:
							return (itemB.decay ?? 999999) - (itemA.decay ?? 999999);

						case InventoryItemFlag.PreferLowerWeight:
							return itemA.getTotalWeight() - itemB.getTotalWeight();
					}
				});

				if (itemInfo.allowMultiple !== undefined) {
					const newItems = sortedItems.slice(0, Math.min(sortedItems.length, itemInfo.allowMultiple));
					const existingItems = context.inventory[key] as Item[] | undefined;

					if (existingItems === undefined || (newItems.join(",") !== existingItems.join(","))) {
						this.log.info(`Found "${key}" - ${newItems.map(item => item).join(", ")} `);
					}

					context.inventory[key] = newItems as any;

				} else {
					const currentItem = context.inventory[key] as Item | undefined;
					const item = sortedItems[0];
					if (currentItem !== item) {
						context.inventory[key] = item as any;
						this.log.info(`Found "${key}" - ${item}`);
					}
				}
			}
		}

		return ObjectiveResult.Ignore;
	}

	public static getItems(context: Context, itemInfo: IInventoryItemInfo) {
		const items: Set<Item> = new Set();

		if (itemInfo.itemTypes) {
			const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;

			for (const itemTypeOrGroup of itemTypes) {
				if (context.island.items.isGroup(itemTypeOrGroup)) {
					items.addFrom(context.island.items.getItemsInContainerByGroup(context.human.inventory, itemTypeOrGroup));

				} else {
					items.addFrom(context.island.items.getItemsInContainerByType(context.human.inventory, itemTypeOrGroup));
				}
			}
		}

		if (itemInfo.actionTypes) {
			for (const useType of itemInfo.actionTypes) {
				items.addFrom(context.utilities.item.getInventoryItemsWithUse(context, useType));
			}
		}

		if (itemInfo.equipType) {
			items.addFrom(context.utilities.item.getInventoryItemsWithEquipType(context, itemInfo.equipType));
		}

		if (itemInfo.requiredMinDur !== undefined) {
			for (const item of Array.from(items)) {
				if (item.minDur !== undefined && item.minDur < itemInfo.requiredMinDur) {
					items.delete(item);
				}
			}
		}

		for (const item of Array.from(items)) {
			if (!context.utilities.item.isAllowedToUseItem(context, item, false)) {
				items.delete(item);
			}
		}

		return items;
	}

	private isValid(context: Context, itemInfo: IInventoryItemInfo, item: Item) {
		if (!item.isValid()) {
			return false;
		}

		if (itemInfo.requiredMinDur !== undefined && item.minDur !== undefined && item.minDur < itemInfo.requiredMinDur) {
			return false;
		}

		if (!context.utilities.item.isAllowedToUseItem(context, item, false)) {
			return false;
		}

		if (context.island.items.isContainableInContainer(item, context.human.inventory)) {
			return true;
		}

		if (itemInfo.allowInChests && (context.base.chest.concat(context.base.intermediateChest).some(chest => context.island.items.isContainableInContainer(item, chest)))) {
			return true;
		}

		if (itemInfo.allowOnTiles && context.island.items.isTileContainer(item.containedWithin)) {
			return true;
		}

		return false;
	}

}