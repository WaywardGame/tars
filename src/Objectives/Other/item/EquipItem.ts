import { ActionType } from "game/entity/action/IAction";
import { EquipType } from "game/entity/IHuman";
import Item from "game/item/Item";

import Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";

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
		const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			this.log.error("Invalid equip item");
			return ObjectiveResult.Restart;
		}

		if (item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return new ExecuteAction(ActionType.Equip, (context, action) => {
			action.execute(context.player, item, this.equip);
			return ObjectiveResult.Complete;
		}).setStatus(this);
	}

}
