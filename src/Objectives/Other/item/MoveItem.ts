import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";
import { IContainer } from "../../../../node_modules/@wayward/types/definitions/game/item/IItem";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import ExecuteAction from "../../core/ExecuteAction";

export default class MoveItem extends Objective {

	constructor(private readonly item: Item | undefined, private readonly targetContainer: IContainer) {
		super();
	}

	public getIdentifier(): string {
		return `MoveItem:${this.item}`;
	}

	public getStatus(): string {
		return `Moving ${this.item?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? context.getData(ContextDataType.LastAcquiredItem);
		if (!item) {
			return ObjectiveResult.Restart;
		}

		return new ExecuteAction(ActionType.MoveItem, (context, action) => {
			action.execute(context.player, item, this.targetContainer);
		})
	}

}
