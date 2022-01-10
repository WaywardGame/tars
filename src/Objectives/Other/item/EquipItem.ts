import { ActionType } from "game/entity/action/IAction";
import type { EquipType } from "game/entity/IHuman";
import type Item from "game/item/Item";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import ReserveItems from "../../core/ReserveItems";

export default class EquipItem extends Objective {

	constructor(private readonly equip: EquipType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `EquipItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Equipping ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid()) {
			this.log.error("Invalid equip item");
			return ObjectiveResult.Restart;
		}

		if (item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(ActionType.Equip, (context, action) => {
				action.execute(context.player, item, this.equip);
				return ObjectiveResult.Complete;
			}).setStatus(this),
		];
	}

}
