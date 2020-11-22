import { ActionType } from "entity/action/IAction";
import { EquipType } from "entity/IHuman";
import Item from "item/Item";

import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";

export default class Equip extends Objective {

	constructor(private readonly equip: EquipType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `Equip:${this.item}`;
	}

	public getStatus(): string {
		return `Equipping ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item || context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			return ObjectiveResult.Restart;
		}

		if (item.isEquipped()) {
			return ObjectiveResult.Complete;
		}

		return new ExecuteAction(ActionType.Equip, (context, action) => {
			action.execute(context.player, item, this.equip);
		});
	}

}
