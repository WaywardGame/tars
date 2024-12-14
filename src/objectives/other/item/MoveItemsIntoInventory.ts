import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type Tile from "@wayward/game/game/tile/Tile";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import MoveItemsFromContainer from "./MoveItemsFromContainer";
import MoveItemsFromTileContainer from "./MoveItemsFromTileContainer";

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

		if (items.some(item => item?.containedWithin?.asTile)) {
			// items are in a tile container
			// we can pickup items from the current tile or facing tile. plan/pick the best case
			return [
				[
					// todo: should planner be smart enough to make this happen automatically? this is required to avoid NotPlausible issues with GatherFromChest
					new MoveToTarget(tile, true).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
					new MoveItemsFromTileContainer(items as Item[], this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, items[0] as Item), tile),
				],
				[
					new MoveToTarget(tile, false).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
					new MoveItemsFromTileContainer(items as Item[], this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, items[0] as Item), tile),
				],
			];
		}

		return [
			// todo: should planner be smart enough to make this happen automatically? this is required to avoid NotPlausible issues with GatherFromChest
			new MoveToTarget(tile, true).overrideDifficulty(this.isDifficultyOverridden() ? 0 : undefined),
			new MoveItemsFromContainer(items as Item[], this.targetContainer ?? context.utilities.item.getMoveItemToInventoryTarget(context, items[0] as Item), tile),
		];
	}

}
