
import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/ItemDescriptions";
import Enums from "utilities/enum/Enums";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import { IInventoryItems, ReserveType } from "../../../core/ITars";
import { inventoryItemInfo } from "../../../core/ITars";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "./AcquireItem";
import AcquireItemForAction from "./AcquireItemForAction";
import AcquireItemByGroup from "./AcquireItemByGroup";
import AnalyzeInventory from "../../analyze/AnalyzeInventory";

export interface IAcquireInventoryItemOptions {
	reserveType: ReserveType;
	skipHardReservedItems: boolean;
	desiredCount: number;
}

/**
 * Acquires an item that will be kept in the inventory
 * Uses the mapping in {@link inventoryItemInfo}
 */
export default class AcquireInventoryItem extends Objective {

	constructor(private readonly inventoryKey: keyof IInventoryItems, private readonly options?: Partial<IAcquireInventoryItemOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireInventoryItem:${this.inventoryKey}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${this.inventoryKey}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		let item = context.inventory[this.inventoryKey];

		if (Array.isArray(item)) {
			const items = this.options?.skipHardReservedItems ? item.filter(it => !context.isHardReservedItem(it)) : item;
			item = items.length >= (this.options?.desiredCount ?? 1) ? items[0] : undefined;
		}

		if (item !== undefined) {
			context.setData(this.contextDataKey, item);

			if (this.options?.reserveType !== undefined) {
				switch (this.options.reserveType) {
					case ReserveType.Soft:
						context.addSoftReservedItems(item);
						break;

					case ReserveType.Hard:
						context.addHardReservedItems(item);
						break;
				}
			}

			return ObjectiveResult.Ignore;
		}

		context.log.info(`Acquiring ${this.inventoryKey}`);

		const objectivePipelines: IObjective[][] = [];

		const itemInfo = inventoryItemInfo[this.inventoryKey];

		if (itemInfo.itemTypes) {
			const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
			for (const itemTypeOrGroup of itemTypes) {
				if (context.island.items.isGroup(itemTypeOrGroup)) {
					objectivePipelines.push([new AcquireItemByGroup(itemTypeOrGroup).passAcquireData(this), new AnalyzeInventory()]);

				} else {
					objectivePipelines.push([new AcquireItem(itemTypeOrGroup).passAcquireData(this), new AnalyzeInventory()]);
				}
			}
		}

		if (itemInfo.equipType) {
			for (const itemType of Enums.values(ItemType)) {
				const description = itemDescriptions[itemType];
				if (description && description.equip === itemInfo.equipType) {
					objectivePipelines.push([new AcquireItem(itemType).passAcquireData(this), new AnalyzeInventory()]);
				}
			}
		}

		if (itemInfo.actionTypes) {
			for (const actionType of itemInfo.actionTypes) {
				for (const itemType of AcquireItemForAction.getItems(context, actionType)) {
					objectivePipelines.push([new AcquireItem(itemType).passAcquireData(this), new AnalyzeInventory()]);
				}
			}
		}

		return objectivePipelines;
	}

}
