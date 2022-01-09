import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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
		const item = this.item ?? this.getAcquiredItem(context);
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
		}).setStatus(this);
	}

}
