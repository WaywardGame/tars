import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";

import Context, { ContextDataType } from "../../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
import SetContextData from "../../../ContextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../../Core/ExecuteActionForItem";
import AcquireItem from "../AcquireItem";

export default class AcquireWaterContainer extends Objective {

	public getIdentifier(): string {
		return "AcquireWaterContainer";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const messageInABottleObjectives: IObjective[] = [];

		const messageInABottleItem = itemManager.getItemInContainer(context.player.inventory, ItemType.MessageInABottle);
		if (!messageInABottleItem) {
			messageInABottleObjectives.push(new AcquireItem(ItemType.MessageInABottle));

		} else {
			messageInABottleObjectives.push(new SetContextData(ContextDataType.LastAcquiredItem, messageInABottleItem));
		}

		messageInABottleObjectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [ItemType.GlassBottle], ActionType.OpenBottle, (context, action) => {
			const item = context.getData(ContextDataType.LastAcquiredItem);
			if (!item) {
				this.log.error("Invalid item");
				return;
			}

			action.execute(context.player, item);
		}).setStatus("Opening glass bottle"));

		return [
			[new AcquireItem(ItemType.Waterskin)],
			[new AcquireItem(ItemType.ClayJug)],
			[new AcquireItem(ItemType.GlassBottle)],
			messageInABottleObjectives,
		];
	}

}
