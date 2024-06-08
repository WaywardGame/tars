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

import { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import MoveItems from "./MoveItems";

/**
 * This assumes all the items are on the same tile!
 */
export default class MoveItemsIntoInventory extends Objective {

	private readonly items: Item[] | undefined;

	constructor(itemOrItems: Item | Item[] | undefined, private readonly tile?: Tile, private readonly targetContainer?: IContainer) {
		super();

		this.items = itemOrItems ? (Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]) : undefined;
	}

	public getIdentifier(): string {
		return `MoveItemsIntoInventory:${this.items?.join(",")}`;
	}

	public getStatus(): string | undefined {
		return `Moving ${this.items?.join(",")} into inventory`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const items = this.items ?? [this.getAcquiredItem(context)];
		if (items.some(item => !item?.isValid)) {
			this.log.warn(`Unable to move item "${items}" into the inventory`);
			return ObjectiveResult.Restart;
		}

		if (items.every(item => context.island.items.isContainableInContainer(item as Item, context.human.inventory))) {
			return ObjectiveResult.Complete;
		}

		const tile = this.tile ?? (items[0] as Item).tile;
		if (!tile) {
			return ObjectiveResult.Impossible;
		}

		return [
			// todo: should planner be smart enough to make this happen automatically? this is required to avoid NotPlausible issues with GatherFromChest
			new MoveToTarget(tile, true).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
			new MoveItems(items as Item[], this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, items[0] as Item), tile),
		];
	}

}
