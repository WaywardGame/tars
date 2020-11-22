import { ActionType } from "entity/action/IAction";
import Item from "item/Item";

import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";

export default class ReinforceItem extends Objective {

	constructor(private readonly item: Item, private readonly threshold?: number) {
		super();
	}

	public getIdentifier(): string {
		return `ReinforceItem:${this.item}:${this.threshold}`;
	}

	public getStatus(): string {
		return `Reinforcing ${this.item.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.item.isValid()) {
			return ObjectiveResult.Restart;
		}

		const minDur = this.item.minDur;
		const maxDur = this.item.maxDur;
		if (minDur === undefined || maxDur === undefined) {
			return ObjectiveResult.Ignore;
		}

		if (this.threshold !== undefined) {
			const defaultDuribility = itemManager.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
			if (maxDur / defaultDuribility > this.threshold) {
				return ObjectiveResult.Ignore;
			}
		}

		this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);

		return [
			new AcquireItemForAction(ActionType.Reinforce),
			new Lambda(async context => {
				const reinforcer = context.getData(ContextDataType.LastAcquiredItem);
				if (!reinforcer) {
					return ObjectiveResult.Restart;
				}

				return (new ExecuteAction(ActionType.Reinforce, (context, action) => {
					action.execute(context.player, reinforcer, this.item);
				}).setStatus(this));
			}),
		];
	}

}
