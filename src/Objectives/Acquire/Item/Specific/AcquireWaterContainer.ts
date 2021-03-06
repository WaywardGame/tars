import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";

import Context from "../../../../Context";
import { ContextDataType } from "../../../../IContext";
import { IObjective, ObjectiveExecutionResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
import { itemUtilities } from "../../../../utilities/Item";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../../core/ExecuteActionForItem";
import AcquireItem from "../AcquireItem";

export default class AcquireWaterContainer extends Objective {

	public getIdentifier(): string {
		return "AcquireWaterContainer";
	}

	public getStatus(): string {
		return "Acquiring a water container";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const messageInABottleObjectives: IObjective[] = [];

		const messageInABottleItem = itemUtilities.getItemInInventory(context, ItemType.MessageInABottle);
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
