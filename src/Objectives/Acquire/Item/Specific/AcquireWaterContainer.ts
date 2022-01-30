import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";

import type Context from "../../../../core/context/Context";
import { ContextDataType } from "../../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../../core/ExecuteActionForItem";
import AcquireItem from "../AcquireItem";

export default class AcquireWaterContainer extends Objective {

	public getIdentifier(): string {
		return "AcquireWaterContainer";
	}

	public getStatus(): string | undefined {
		return "Acquiring a water container";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const messageInABottleObjectives: IObjective[] = [];

		const messageInABottleItem = context.utilities.item.getItemInInventory(context, ItemType.MessageInABottle);
		if (!messageInABottleItem) {
			messageInABottleObjectives.push(new AcquireItem(ItemType.MessageInABottle).passAcquireData(this).setContextDataKey(ContextDataType.Item1));

		} else {
			messageInABottleObjectives.push(new SetContextData(ContextDataType.Item1, messageInABottleItem));
		}

		messageInABottleObjectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [ItemType.GlassBottle], ActionType.OpenBottle, (context, action) => {
			const item = context.getData(ContextDataType.Item1);
			if (!item?.isValid()) {
				this.log.warn(`Invalid message in a bottle item. ${messageInABottleItem}`);
				return;
			}

			action.execute(context.actionExecutor, item);
		}).setStatus("Opening glass bottle"));

		return [
			[new AcquireItem(ItemType.Waterskin).passAcquireData(this)],
			[new AcquireItem(ItemType.ClayJug).passAcquireData(this)],
			[new AcquireItem(ItemType.GlassBottle).passAcquireData(this)],
			messageInABottleObjectives,
		];
	}

}
