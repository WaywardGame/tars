import { ItemType } from "game/item/IItem";

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
