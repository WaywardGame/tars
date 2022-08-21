import type Item from "game/item/Item";
import Unequip from "game/entity/action/actions/Unequip";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import ReserveItems from "../../core/ReserveItems";

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
		if (!item?.isValid()) {
			this.log.error("Invalid unequip item");
			return ObjectiveResult.Restart;
		}

		if (!item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(Unequip, [item]).setStatus(this),
		];
	}

}
