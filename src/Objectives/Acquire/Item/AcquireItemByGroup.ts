import { ItemType, ItemTypeGroup } from "item/IItem";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";

import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByGroup extends AcquireBase {

	private static readonly cache: Map<ItemTypeGroup, ItemType[]> = new Map();

	constructor(private readonly itemTypeGroup: ItemTypeGroup) {
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
		return this.getItems().some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return this.getItems()
			.map(item => [new AcquireItem(item).passContextDataKey(this)]);
	}

	private getItems(): ItemType[] {
		let result = AcquireItemByGroup.cache.get(this.itemTypeGroup);
		if (result === undefined) {
			result = Array.from(itemManager.getGroupItems(this.itemTypeGroup));
			AcquireItemByGroup.cache.set(this.itemTypeGroup, result);
		}

		return result;
	}
}
