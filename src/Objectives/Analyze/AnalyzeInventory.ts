import ProtectItem from "game/entity/action/actions/ProtectItem";
import Item from "game/item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { IInventoryItemInfo, IInventoryItems, InventoryItemFlag, inventoryItemInfo } from "../../ITars";
import Objective from "../../Objective";
import { getInventoryItemsWithEquipType, getInventoryItemsWithUse } from "../../utilities/Item";

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

			const flags = itemInfo.flags !== undefined ? itemInfo.flags : InventoryItemFlag.PreferHigherWorth;

			// use a set to prevent duplicates
			const items: Set<Item> = new Set();

			if (itemInfo.itemTypes) {
				for (const itemTypeOrGroup of itemInfo.itemTypes) {
					if (itemManager.isGroup(itemTypeOrGroup)) {
						items.addFrom(itemManager.getItemsInContainerByGroup(context.player.inventory, itemTypeOrGroup));

					} else {
						items.addFrom(itemManager.getItemsInContainerByType(context.player.inventory, itemTypeOrGroup));
					}
				}
			}

			if (itemInfo.actionTypes) {
				for (const useType of itemInfo.actionTypes) {
					items.addFrom(getInventoryItemsWithUse(context, useType));
				}
			}

			if (itemInfo.equipType) {
				items.addFrom(getInventoryItemsWithEquipType(context, itemInfo.equipType));
			}

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

					if (itemInfo.protect) {
						if (existingItems) {
							for (const item of existingItems) {
								if (item.isValid() && item.protected && !newItems.includes(item)) {
									ProtectItem.execute(context.player, item, false);
								}
							}
						}

						for (const item of newItems) {
							if (item.isValid() && !item.protected) {
								ProtectItem.execute(context.player, item, true);
							}
						}
					}

				} else {
					const currentItem = context.inventory[key] as Item | undefined;
					const item = sortedItems[0];
					if (currentItem !== item) {
						if (itemInfo.protect && currentItem && currentItem.isValid() && currentItem.protected) {
							ProtectItem.execute(context.player, currentItem, false);
						}

						context.inventory[key] = item as any;
						this.log.info(`Found "${key}" - ${item} `);

						if (itemInfo.protect) {
							ProtectItem.execute(context.player, item, true);
						}
					}
				}
			}
		}

		this.log.debug(context.inventory);

		return ObjectiveResult.Ignore;
	}

	private isValid(context: Context, itemInfo: IInventoryItemInfo, item: Item) {
		if (!item.isValid()) {
			return false;
		}

		if (itemManager.isContainableInContainer(item, context.player.inventory)) {
			return true;
		}

		if (itemInfo.allowInChests) {
			return context.base.chest.some(chest => itemManager.isContainableInContainer(item, chest));
		}

		return false;
	}
}
