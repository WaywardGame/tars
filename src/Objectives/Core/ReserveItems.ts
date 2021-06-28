import Item from "game/item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
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
		return `ReserveItem:${this.items.join(",")}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		context.addReservedItems(...this.items);
		return ObjectiveResult.Complete;
	}

}
