import { ActionType } from "entity/action/IAction";
import Item from "item/Item";

import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";

export default class Unequip extends Objective {

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `Unequip:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item || context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			return ObjectiveResult.Restart;
		}

		if (!item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return new ExecuteAction(ActionType.Unequip, (context, action) => {
			action.execute(context.player, item);
		});
	}

}