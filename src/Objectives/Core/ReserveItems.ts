import Item from "game/item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { ReserveType } from "../../ITars";
import Objective from "../../Objective";

/**
 * Marks items that will be used to complete the objective
 */
export default class ReserveItems extends Objective {

	public items: Item[];

	constructor(...items: Item[]) {
		super();

		this.items = items;
	}

	public getIdentifier(): string {
		return `ReserveItem:${ReserveType[this.reserveType ?? ReserveType.Hard]}:${this.items.join(",")}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.reserveType === ReserveType.Soft) {
			context.addSoftReservedItems(...this.items);

		} else {
			context.addHardReservedItems(...this.items);
		}

		return ObjectiveResult.Complete;
	}

}
