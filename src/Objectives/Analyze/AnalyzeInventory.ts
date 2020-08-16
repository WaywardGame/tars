import Item from "item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { IInventoryItems, InventoryItemFlag, inventoryItemInfo } from "../../ITars";
import Objective from "../../Objective";
import { getInventoryItemsWithEquipType, getInventoryItemsWithUse } from "../../Utilities/Item";

export default class AnalyzeInventory extends Objective {

	public getIdentifier(): string {
		return "AnalyzeInventory";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		const keys = Object.keys(inventoryItemInfo) as Array<keyof IInventoryItems>;
		for (const key of keys) {
			let itemOrItems = context.inventory[key];

			if (itemOrItems !== undefined) {
				let invalidate = false;

				if (Array.isArray(itemOrItems)) {
					itemOrItems = (context.inventory[key] as any) = itemOrItems.filter(item => item.isValid() && itemManager.isContainableInContainer(item, context.player.inventory));
					if (itemOrItems.length === 0) {
						invalidate = true;
					}

				} else if (!itemOrItems.isValid() || !itemManager.isContainableInContainer(itemOrItems, context.player.inventory)) {
					invalidate = true;
				}

				if (invalidate) {
					itemOrItems = context.inventory[key] = undefined;
					this.log.info(`"${key}" was removed`);
				}
			}

			const itemInfo = inventoryItemInfo[key];
			const flags = itemInfo.flags !== undefined ? itemInfo.flags : InventoryItemFlag.PreferHigherWorth;

			const items: Item[] = [];

			if (itemInfo.itemTypes) {
				for (const itemTypeOrGroup of itemInfo.itemTypes) {
					if (itemManager.isGroup(itemTypeOrGroup)) {
						items.push(...itemManager.getItemsInContainerByGroup(context.player.inventory, itemTypeOrGroup));

					} else {
						items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemTypeOrGroup));
					}
				}
			}

			if (itemInfo.useTypes) {
				for (const useType of itemInfo.useTypes) {
					items.push(...getInventoryItemsWithUse(context, useType));
				}
			}

			if (itemInfo.equipType) {
				items.push(...getInventoryItemsWithEquipType(context, itemInfo.equipType));
			}

			if (items.length > 0) {
				const sortedItems = items.sort((itemA, itemB) => {
					const descriptionA = itemA.description();
					const descriptionB = itemB.description();

					if (!descriptionA || !descriptionB) {
						return -1;
					}

					switch (flags) {
						case InventoryItemFlag.PreferHigherWorth:
							if (descriptionA.worth === undefined) {
								return -1;
							}

							if (descriptionB.worth === undefined) {
								return 1;
							}

							return descriptionA.worth < descriptionB.worth ? 1 : -1;

						case InventoryItemFlag.PreferLowerWeight:
							return itemA.getTotalWeight() > itemB.getTotalWeight() ? 1 : -1;

						case InventoryItemFlag.PreferHigherDurability:
							const minDurA = itemA.minDur !== undefined ? itemA.minDur : 999999;
							const minDurB = itemB.minDur !== undefined ? itemB.minDur : 999999;
							return minDurA < minDurB ? 1 : -1;

						case InventoryItemFlag.PreferHigherDecay:
							const decayA = itemA.decay !== undefined ? itemA.decay : 999999;
							const decayB = itemB.decay !== undefined ? itemB.decay : 999999;
							return decayA < decayB ? 1 : -1;
					}
				});

				if (itemInfo.allowMultiple !== undefined) {
					const newItems = sortedItems.slice(0, Math.min(sortedItems.length, itemInfo.allowMultiple));
					const existingItems = context.inventory[key] as Item[] | undefined;

					if (existingItems === undefined || (newItems.join(",") !== existingItems.join(","))) {
						this.log.info(`Found "${key}" - ${newItems.map(item => item).join(", ")}`);
					}

					context.inventory[key] = newItems as any;

				} else {
					const item = sortedItems[0];
					if (context.inventory[key] !== item) {
						context.inventory[key] = item as any;
						this.log.info(`Found "${key}" - ${item}`);
					}
				}
			}
		}

		return ObjectiveResult.Ignore;
	}

}
