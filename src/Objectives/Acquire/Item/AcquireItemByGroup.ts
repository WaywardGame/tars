import { ItemType, ItemTypeGroup } from "game/item/IItem";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";

import AcquireBase, { IAcquireItemOptions } from "./AcquireBase";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByGroup extends AcquireBase {

	private static readonly cache: Map<ItemTypeGroup, ItemType[]> = new Map();

	constructor(private readonly itemTypeGroup: ItemTypeGroup, private readonly options: Partial<IAcquireItemOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemByGroup:${ItemTypeGroup[this.itemTypeGroup]}`;
	}

	public getStatus(): string {
		return `Acquiring ${itemManager.getItemTypeGroupName(this.itemTypeGroup)}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.getItemTypes().some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		let itemTypes = this.getItemTypes();
		if (this.options.excludeItemTypes) {
			itemTypes = itemTypes.filter(itemType => !this.options.excludeItemTypes!.has(itemType));
		}

		return itemTypes.map(itemType => [new AcquireItem(itemType, this.options).passContextDataKey(this)]);
	}

	private getItemTypes(): ItemType[] {
		let result = AcquireItemByGroup.cache.get(this.itemTypeGroup);
		if (result === undefined) {
			result = Array.from(itemManager.getGroupItems(this.itemTypeGroup));
			AcquireItemByGroup.cache.set(this.itemTypeGroup, result);
		}

		return result;
	}
}
