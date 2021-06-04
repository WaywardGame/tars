import { ItemType } from "game/item/IItem";
import Translation, { ListEnder } from "language/Translation";
import { Dictionary } from "language/Dictionaries";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";

import AcquireBase from "./AcquireBase";
import AcquireItem from "./AcquireItem";

export default class AcquireItemByTypes extends AcquireBase {

	constructor(private readonly itemTypes: ItemType[]) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemByTypes:${this.itemTypes.map(itemType => ItemType[itemType]).join(",")}`;
	}

	public getStatus(): string {
		const itemTypesString = this.itemTypes
			.map(itemType => Translation.nameOf(Dictionary.Item, itemType))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${itemTypesString}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.itemTypes.some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return this.itemTypes
			.map(item => [new AcquireItem(item).passContextDataKey(this)]);
	}

}
