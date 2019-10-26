import { ActionType } from "entity/action/IAction";
import Item from "item/Item";

import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";

export default class UseItem extends Objective {

	constructor(private readonly actionType: ActionType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `UseItem:${this.item}:${ActionType[this.actionType]}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item || context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			return ObjectiveResult.Restart;
		}

		const description = item.description();
		if (!description || !description.use || description.use[this.actionType] === -1) {
			this.log.error("Invalid use item", item, this.actionType);
			return ObjectiveResult.Restart;
		}

		return new ExecuteAction(ActionType.UseItem, (context, action) => {
			action.execute(context.player, item, this.actionType);
		});
	}

}
