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

import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";
import Enums from "@wayward/game/utilities/enum/Enums";

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
import { IAcquireItemOptions } from "./AcquireBase";

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
		let numberOfMissingItems: number;

		let item = context.inventory[this.inventoryKey];
		if (Array.isArray(item)) {
			const items = this.options?.skipHardReservedItems ? item.filter(it => !context.isHardReservedItem(it)) : item;
			numberOfMissingItems = (this.options?.desiredCount ?? 1) - items.length;
			item = numberOfMissingItems <= 0 ? items[0] : undefined;

		} else if (!item) {
			numberOfMissingItems = 1;

		} else {
			numberOfMissingItems = 0;
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

		context.log.info(`Acquiring ${this.inventoryKey}. Number of missing: ${numberOfMissingItems}`);

		const objectivePipelines: IObjective[][] = [];

		const itemInfo = inventoryItemInfo[this.inventoryKey];
		const options: Partial<IAcquireItemOptions> | undefined = itemInfo?.requiredMinDur !== undefined ? { requiredMinDur: itemInfo.requiredMinDur } : undefined;

		if (itemInfo.itemTypes) {
			const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
			for (const itemTypeOrGroup of itemTypes) {
				objectivePipelines.push(this.getObjectivePipeline(context, itemTypeOrGroup, numberOfMissingItems, options));
			}
		}

		if (itemInfo.equipType) {
			for (const itemType of Enums.values(ItemType)) {
				const description = itemDescriptions[itemType];
				if (description && description.equip === itemInfo.equipType) {
					objectivePipelines.push(this.getObjectivePipeline(context, itemType, numberOfMissingItems, options));
				}
			}
		}

		if (itemInfo.actionTypes) {
			for (const actionType of itemInfo.actionTypes) {
				for (const itemType of AcquireItemForAction.getItems(context, actionType)) {
					objectivePipelines.push(this.getObjectivePipeline(context, itemType, numberOfMissingItems, options));
				}
			}
		}

		return objectivePipelines;
	}

	private getObjectivePipeline(context: Context, itemTypeOrGroup: ItemType | ItemTypeGroup, numberOfItems: number, options: Partial<IAcquireItemOptions> | undefined): IObjective[] {
		const objectivePipeline: IObjective[] = [];

		for (let i = 0; i < numberOfItems; i++) {
			if (context.island.items.isGroup(itemTypeOrGroup)) {
				objectivePipeline.push(new AcquireItemByGroup(itemTypeOrGroup, options).passAcquireData(this));

			} else {
				objectivePipeline.push(new AcquireItem(itemTypeOrGroup, options).passAcquireData(this));
			}
		}

		objectivePipeline.push(new AnalyzeInventory());

		return objectivePipeline;
	}

}
