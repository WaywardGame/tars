
import { ItemType } from "game/item/IItem";
import itemDescriptions from "game/item/Items";
import Enums from "utilities/enum/Enums";

import Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import { IInventoryItems, inventoryItemInfo, InventoryItemFlag } from "../../core/ITars";
import Objective from "../../core/objective/Objective";
import AcquireItem from "../acquire/item/AcquireItem";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";

export default class UpgradeInventoryItem extends Objective {

	constructor(private readonly upgrade: keyof IInventoryItems) {
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

		const description = item.description();
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
					const currentItemTier = item.description()?.tier?.[flags.option];

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
		};

		if (itemInfo.itemTypes) {
			const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes() : itemInfo.itemTypes;
			for (const itemTypeOrGroup of itemTypes) {
				if (itemTypeOrGroup !== item.type) {
					if (context.island.items.isGroup(itemTypeOrGroup)) {
						const groupItems = context.island.items.getGroupItems(itemTypeOrGroup);
						for (const groupItemType of groupItems) {
							this.addUpgradeObjectives(objectivePipelines, groupItemType, isUpgrade);
						}

					} else {
						this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, isUpgrade);
					}
				}
			}
		}

		if (itemInfo.equipType) {
			for (const itemType of Enums.values(ItemType)) {
				const description = itemDescriptions[itemType];
				if (description && description.equip === itemInfo.equipType) {
					this.addUpgradeObjectives(objectivePipelines, itemType, isUpgrade);
				}
			}
		}

		if (itemInfo.actionTypes) {
			for (const actionType of itemInfo.actionTypes) {
				for (const itemType of AcquireItemForAction.getItems(context, actionType)) {
					this.addUpgradeObjectives(objectivePipelines, itemType, isUpgrade);
				}
			}
		}

		return objectivePipelines;
	}

	private addUpgradeObjectives(objectives: IObjective[][], itemType: ItemType, isUpgrade: (itemType: ItemType) => boolean) {
		if (isUpgrade(itemType)) {
			objectives.push([new AcquireItem(itemType)]);
		}
	}
}
