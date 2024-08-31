import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import OpenBottle from "@wayward/game/game/entity/action/actions/OpenBottle";
import { ItemType } from "@wayward/game/game/item/IItem";

import type Context from "../../../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../../core/ExecuteActionForItem";
import ReserveItems from "../../../core/ReserveItems";
import AcquireItem from "../AcquireItem";

export default class AcquireWaterContainer extends Objective {

	public getIdentifier(): string {
		return "AcquireWaterContainer";
	}

	public getStatus(): string | undefined {
		return "Acquiring a water container";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const itemContextDataKey = this.getUniqueContextDataKey("MessageInABottle");

		const messageInABottleObjectives: IObjective[] = [];

		const messageInABottleItem = context.utilities.item.getItemInInventory(context, ItemType.MessageInABottle);
		if (messageInABottleItem) {
			messageInABottleObjectives.push(new ReserveItems(messageInABottleItem));
			messageInABottleObjectives.push(new SetContextData(itemContextDataKey, messageInABottleItem));

		} else {
			messageInABottleObjectives.push(new AcquireItem(ItemType.MessageInABottle).passAcquireData(this).setContextDataKey(itemContextDataKey));
		}

		messageInABottleObjectives.push(new ExecuteActionForItem(
			ExecuteActionType.Generic,
			[ItemType.GlassBottle],
			{
				genericAction: {
					action: OpenBottle,
					args: (context) => {
						const item = context.getData(itemContextDataKey);
						if (!item?.isValid) {
							this.log.warn(`Invalid message in a bottle item. ${messageInABottleItem}`);
							return ObjectiveResult.Restart;
						}

						return [item] as ActionArgumentsOf<typeof OpenBottle>;
					},
				},
			}).setStatus("Opening glass bottle"));

		return [
			[new AcquireItem(ItemType.Waterskin).passAcquireData(this)],
			[new AcquireItem(ItemType.ClayJug).passAcquireData(this)],
			[new AcquireItem(ItemType.GlassBottle).passAcquireData(this)],
			messageInABottleObjectives,
		];
	}

}
