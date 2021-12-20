import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { itemUtilities } from "../../../utilities/Item";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import SetContextData from "../../contextData/SetContextData";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";

/**
 * Reinforces an item if
 * 1. the items (max durability / default max durability) is less than the target multiplier
 * 2. the item is worth at least as much as minWorth
 */
export default class ReinforceItem extends Objective {

	constructor(private readonly item: Item, private readonly options: Partial<{ minWorth: number; targetDurabilityMultipler: number; }> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `ReinforceItem:${this.item}:${this.options.targetDurabilityMultipler}:${this.options.minWorth}`;
	}

	public getStatus(): string | undefined {
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

		if (this.options.minWorth !== undefined) {
			const worth = this.item.description()?.worth;
			if (worth === undefined || worth < this.options.minWorth) {
				return ObjectiveResult.Ignore;
			}
		}

		if (this.options.targetDurabilityMultipler !== undefined) {
			const defaultDurability = context.island.items.getDefaultDurability(context.player, this.item.weight, this.item.type, true);
			if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
				return ObjectiveResult.Ignore;
			}
		}

		this.log.info(`Reinforcing item. Current durability: ${minDur}/${maxDur}`);

		const objectives: IObjective[] = [];

		const reinforceItems = itemUtilities.getInventoryItemsWithUse(context, ActionType.Reinforce);
		if (reinforceItems.length === 0) {
			objectives.push(new AcquireItemForAction(ActionType.Reinforce));

		} else {
			objectives.push(new SetContextData(ContextDataType.LastAcquiredItem, reinforceItems[0]));
		}

		objectives.push(new Lambda(async context => {
			const reinforceItem = context.getData(ContextDataType.LastAcquiredItem);
			if (!reinforceItem) {
				this.log.error("Invalid reinforce item");
				return ObjectiveResult.Restart;
			}

			return (new ExecuteAction(ActionType.Reinforce, (context, action) => {
				action.execute(context.player, reinforceItem, this.item);
				return ObjectiveResult.Complete;
			}).setStatus(this));
		}));

		return objectives;
	}

}
