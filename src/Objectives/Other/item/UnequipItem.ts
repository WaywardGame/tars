import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";

export default class UnequipItem extends Objective {

	constructor(private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `Unequip:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Unequipping ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			this.log.error("Invalid unequip item");
			return ObjectiveResult.Restart;
		}

		if (!item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return new ExecuteAction(ActionType.Unequip, (context, action) => {
			action.execute(context.player, item);
			return ObjectiveResult.Complete;
		});
	}

}
