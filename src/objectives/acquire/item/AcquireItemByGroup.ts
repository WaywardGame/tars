import type { ItemType } from "game/item/IItem";
import { ItemTypeGroup } from "game/item/IItem";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ItemUtilities } from "../../../utilities/Item";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByGroup extends AcquireBase {

	private static readonly cache: Map<ItemTypeGroup, ItemType[]> = new Map();

	constructor(private readonly itemTypeGroup: ItemTypeGroup, private readonly options: Partial<IAcquireItemOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemByGroup:${ItemTypeGroup[this.itemTypeGroup]}`;
	}

	public getStatus(context: Context): string | undefined {
		return `Acquiring ${context.island.items.getItemTypeGroupName(this.itemTypeGroup)}`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypesByGroup(this.itemTypeGroup);
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.getItemTypes(context).some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		let itemTypes = this.getItemTypes(context);
		if (this.options.excludeItemTypes) {
			itemTypes = itemTypes.filter(itemType => !this.options.excludeItemTypes!.has(itemType));
		}

		return itemTypes.map(itemType => [new AcquireItem(itemType, this.options).passAcquireData(this)]);
	}

	private getItemTypes(context: Context): ItemType[] {
		let result = AcquireItemByGroup.cache.get(this.itemTypeGroup);
		if (result === undefined) {
			result = Array.from(context.island.items.getGroupItems(this.itemTypeGroup));
			AcquireItemByGroup.cache.set(this.itemTypeGroup, result);
		}

		return result;
	}
}