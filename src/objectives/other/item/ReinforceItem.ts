/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Reinforce from "game/entity/action/actions/Reinforce";
import { ActionArguments, ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItemForAction from "../../acquire/item/AcquireItemForAction";
import SetContextData from "../../contextData/SetContextData";
import ExecuteAction from "../../core/ExecuteAction";
import Lambda from "../../core/Lambda";
import ReserveItems from "../../core/ReserveItems";

/**
 * Reinforces an item if
 * 1. the items (max durability / default max durability) is less than the target multiplier
 * 2. the item is worth at least as much as minWorth
 */
export default class ReinforceItem extends Objective {

	constructor(private readonly item: Item, private readonly options: Partial<{ minWorth: number; targetDurabilityMultipler: number }> = {}) {
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

		if (!this.needsReinforcement(context)) {
			return ObjectiveResult.Ignore;
		}

		this.log.info(`Reinforcing item. Current durability: ${this.item.durability}/${this.item.durabilityMax}`);

		const itemContextDataKey = this.getUniqueContextDataKey("ReinforceItem");

		const objectives: IObjective[] = [];

		const reinforceItems = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Reinforce);
		if (reinforceItems.length > 0) {
			objectives.push(new ReserveItems(reinforceItems[0]).keepInInventory());
			objectives.push(new SetContextData(itemContextDataKey, reinforceItems[0]));

		} else {
			objectives.push(new AcquireItemForAction(ActionType.Reinforce).setContextDataKey(itemContextDataKey));
		}

		objectives.push(
			new ExecuteAction(Reinforce, (context) => {
				const reinforceItem = context.getData(itemContextDataKey);
				if (!reinforceItem) {
					this.log.error("Invalid reinforce item");
					return ObjectiveResult.Restart;
				}

				return [reinforceItem, this.item] as ActionArguments<typeof Reinforce>;
			}).setStatus(this),
			new Lambda(async context => {
				if (this.needsReinforcement(context)) {
					this.log.info("Needs more reinforcement");
					return ObjectiveResult.Restart;
				}

				return ObjectiveResult.Complete;
			}).setStatus(this),
		);

		return objectives;
	}

	private needsReinforcement(context: Context): boolean {
		const minDur = this.item.durability;
		const maxDur = this.item.durabilityMax;
		if (minDur === undefined || maxDur === undefined) {
			return false;
		}

		if (this.options.minWorth !== undefined) {
			const worth = this.item.description?.worth;
			if (worth === undefined || worth < this.options.minWorth) {
				return false;
			}
		}

		if (this.options.targetDurabilityMultipler !== undefined) {
			const defaultDurability = context.island.items.getDefaultDurability(context.human, this.item.weight, this.item.type, true);
			if (maxDur / defaultDurability >= this.options.targetDurabilityMultipler) {
				return false;
			}
		}

		return true;
	}
}
