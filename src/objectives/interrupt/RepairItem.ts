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

import Repair from "@wayward/game/game/entity/action/actions/Repair";
import { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import ExecuteAction from "../core/ExecuteAction";
import CompleteRequirements from "../utility/CompleteRequirements";

export default class RepairItem extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `RepairItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Repairing ${this.item.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.item === context.inventory.hammer) {
			return ObjectiveResult.Ignore;
		}

		if (this.item.durability === undefined || this.item.durabilityMax === undefined) {
			this.log.warn(`Can't repair item ${this.item}, invalid durability`);
			return ObjectiveResult.Ignore;
		}

		const description = this.item.description;
		if (!description || description.durability === undefined || description.repairable === false) {
			// this.log.warn("item isn't repariable", this.item, description);
			return ObjectiveResult.Ignore;
		}

		if (context.human.isSwimming) {
			return ObjectiveResult.Ignore;
		}

		return [
			new AcquireInventoryItem("hammer"),
			new CompleteRequirements(context.island.items.hasAdditionalRequirements(context.human, this.item.type, undefined, true)),
			new ExecuteAction(Repair, (context) => {
				const hammer = context.inventory.hammer;
				if (!hammer) {
					this.log.error("Invalid hammer");
					return ObjectiveResult.Restart;
				}

				return [hammer, this.item] as ActionArgumentsOf<typeof Repair>;
			}).setStatus(this),
		];
	}

}
