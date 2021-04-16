
import { ItemType } from "game/item/IItem";
import itemDescriptions from "game/item/Items";
import Enums from "utilities/enum/Enums";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { IInventoryItems, inventoryItemInfo } from "../../ITars";
import Objective from "../../Objective";
import AcquireItem from "../Acquire/Item/AcquireItem";


export default class UpgradeInventoryItem extends Objective {

	constructor(private readonly upgrade: keyof IInventoryItems) {
		super();
	}

	public getIdentifier(): string {
		return `UpgradeInventoryItem:${this.upgrade}`;
	}

	public getStatus(): string {
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

		const worth = description.worth;
		if (worth === undefined) {
			return ObjectiveResult.Complete;
		}

		const objectivePipelines: IObjective[][] = [];

		const itemInfo = inventoryItemInfo[this.upgrade];

		if (itemInfo.itemTypes) {
			for (const itemTypeOrGroup of itemInfo.itemTypes) {
				if (itemTypeOrGroup !== item.type) {
					if (itemManager.isGroup(itemTypeOrGroup)) {
						const groupItems = itemManager.getGroupItems(itemTypeOrGroup);
						for (const groupItemType of groupItems) {
							this.addUpgradeObjectives(objectivePipelines, groupItemType, worth);
						}

					} else {
						this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, worth);
					}
				}
			}
		}

		if (itemInfo.equipType) {
			for (const it of Enums.values(ItemType)) {
				const description = itemDescriptions[it];
				if (description && description.equip === itemInfo.equipType) {
					this.addUpgradeObjectives(objectivePipelines, it, worth, description);
				}
			}
		}

		return objectivePipelines;
	}

	private addUpgradeObjectives(objectives: IObjective[][], itemType: ItemType, currentWorth: number, description = itemDescriptions[itemType]) {
		const itemTypeWorth = description.worth;
		if (itemTypeWorth !== undefined && itemTypeWorth > currentWorth) {
			objectives.push([new AcquireItem(itemType)]);
		}
	}
}
