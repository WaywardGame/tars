/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Item from "@wayward/game/game/item/Item";

import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import { ReserveType } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";

/**
 * Marks items that will be used to complete the objective
 */
export default class ReserveItems extends Objective {

	public override readonly includePositionInHashCode: boolean = false;

	public items: Item[];
	private objectiveHashCode: string | undefined;

	constructor(...items: Item[]) {
		super();

		this.items = items;
	}

	public getIdentifier(): string {
		return `ReserveItems:${ReserveType[this.reserveType ?? ReserveType.Hard]}:${this.shouldKeepInInventory() ? "KeepInInventory:" : ""}${this.objectiveHashCode ?? ""}${this.items.join(",")}`;
	}

	public getStatus(): string | undefined {
		return undefined;
	}

	public passObjectiveHashCode(objectiveHashCode: string): this {
		this.objectiveHashCode = objectiveHashCode;
		return this;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.objectiveHashCode !== undefined) {
			if (this.reserveType === ReserveType.Soft) {
				context.addSoftReservedItemsForObjectiveHashCode(this.objectiveHashCode, ...this.items);

			} else {
				context.addHardReservedItemsForObjectiveHashCode(this.objectiveHashCode, ...this.items);
			}

		} else {
			if (this.reserveType === ReserveType.Soft) {
				context.addSoftReservedItems(...this.items);

			} else {
				context.addHardReservedItems(...this.items);
			}
		}

		if (this.shouldKeepInInventory()) {
			let keepInInventoryItems = context.getData<Set<Item>>(ContextDataType.KeepInInventoryItems);
			if (keepInInventoryItems) {
				keepInInventoryItems.add(...this.items);

			} else {
				keepInInventoryItems = new Set(this.items);
			}

			context.setData(ContextDataType.KeepInInventoryItems, keepInInventoryItems);
		}

		return ObjectiveResult.Complete;
	}

}
