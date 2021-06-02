import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";
import { Dictionary } from "language/Dictionaries";
import Translation, { TextContext } from "language/Translation";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";

export default class UseItem extends Objective {

	constructor(private readonly actionType: ActionType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `UseItem:${this.item}:${ActionType[this.actionType]}`;
	}

	public getStatus(): string {
		return `Using ${this.item?.getName()} for ${Translation.nameOf(Dictionary.Action, this.actionType).inContext(TextContext.Lowercase).getString()} action`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item || context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			return ObjectiveResult.Restart;
		}

		const description = item.description();
		if (!description || !description.use || !description.use.includes(this.actionType)) {
			this.log.error("Invalid use item", item, this.actionType);
			return ObjectiveResult.Restart;
		}

		return new ExecuteAction(ActionType.UseItem, (context, action) => {
			action.execute(context.player, item, this.actionType);
		}).setStatus(this);
	}

}
