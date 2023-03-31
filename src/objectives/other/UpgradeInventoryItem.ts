
import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/ItemDescriptions";
import Enums from "utilities/enum/Enums";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import type { IInventoryItems } from "../../core/ITars";
import { inventoryItemInfo, InventoryItemFlag } from "../../core/ITars";
import Objective from "../../core/objective/Objective";
import AcquireItem from "../acquire/item/AcquireItem";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import Item from "game/item/Item";

export default class UpgradeInventoryItem extends Objective {

	constructor(private readonly upgrade: keyof IInventoryItems, private readonly fromItemTypes: Set<ItemType> = new Set()) {
		super();
	}

	public getIdentifier(): string {
		return `UpgradeInventoryItem:${this.upgrade}`;
	}

	public getStatus(): string | undefined {
		return `Upgrading ${this.upgrade}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = context.inventory[this.upgrade];
		if (!item || Array.isArray(item)) {
			return ObjectiveResult.Complete;
		}

		const description = item.description;
		if (!description) {
			return ObjectiveResult.Complete;
		}

		const currentWorth = description.worth;
		if (currentWorth === undefined) {
			return ObjectiveResult.Complete;
		}

		const objectivePipelines: IObjective[][] = [];

		const itemInfo = inventoryItemInfo[this.upgrade];

		const flags = itemInfo.flags ?? InventoryItemFlag.PreferHigherWorth;

		let isUpgrade: ((itemType: ItemType) => boolean) | undefined;

		if (typeof (flags) === "object") {
			switch (flags.flag) {
				case InventoryItemFlag.PreferHigherActionBonus:
					const currentActionTier = item.getItemUseBonus(flags.option);

					isUpgrade = (itemType: ItemType) => {
						const actionTier = itemDescriptions[itemType]?.actionTier?.[flags.option];
						return actionTier !== undefined && actionTier > currentActionTier;
					};

					break;

				case InventoryItemFlag.PreferHigherTier:
					const currentItemTier = item.description?.tier?.[flags.option];

					isUpgrade = (itemType: ItemType) => {
						const tier = itemDescriptions[itemType]?.tier?.[flags.option];
						return tier !== undefined && currentItemTier !== undefined && tier > currentItemTier;
					};

					break;
			}
		}

		if (!isUpgrade) {
			// default to worth
			isUpgrade = (itemType: ItemType) => {
				const worth = itemDescriptions[itemType]?.worth;
				return worth !== undefined && currentWorth !== undefined && worth > currentWorth;
			};
		}

		if (itemInfo.itemTypes) {
			const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
			for (const itemTypeOrGroup of itemTypes) {
				if (context.island.items.isGroup(itemTypeOrGroup)) {
					const groupItems = context.island.items.getGroupItems(itemTypeOrGroup);
					for (const groupItemType of groupItems) {
						this.addUpgradeObjectives(objectivePipelines, groupItemType, item, isUpgrade);
					}

				} else {
					this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, item, isUpgrade);
				}
			}
		}

		if (itemInfo.equipType) {
			for (const itemType of Enums.values(ItemType)) {
				const description = itemDescriptions[itemType];
				if (description && description.equip === itemInfo.equipType) {
					this.addUpgradeObjectives(objectivePipelines, itemType, item, isUpgrade);
				}
			}
		}

		if (itemInfo.actionTypes) {
			for (const actionType of itemInfo.actionTypes) {
				for (const itemType of AcquireItemForAction.getItems(context, actionType)) {
					this.addUpgradeObjectives(objectivePipelines, itemType, item, isUpgrade);
				}
			}
		}

		return objectivePipelines;
	}

	private addUpgradeObjectives(objectives: IObjective[][], itemType: ItemType, currentItem: Item, isUpgrade: (itemType: ItemType) => boolean) {
		if (currentItem.type !== itemType && !this.fromItemTypes.has(itemType) && isUpgrade(itemType)) {
			objectives.push([new AcquireItem(itemType)]);
		}
	}
}
