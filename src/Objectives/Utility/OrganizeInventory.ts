import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import { IContainer } from "game/item/IItem";
import Item from "game/item/Item";
import TileHelpers from "utilities/game/TileHelpers";
import Vector2 from "utilities/math/Vector2";

import { ContextDataType } from "../..//IContext";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Objective from "../../Objective";
import { isNearBase } from "../../utilities/Base";
import { getReservedItems, getUnusedItems } from "../../utilities/Item";
import { isOpenTile } from "../../utilities/Tile";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";

const maxChestDistance = 128;

export interface IOriganizeInventoryOptions {
	allowChests?: boolean;

	disableDrop?: boolean;

	onlyIfNearBase?: boolean;

	allowReservedItems?: boolean;
	onlyOrganizeReservedItems?: boolean;

	onlyAllowIntermediateChest?: boolean;

	items?: Item[];
}

export default class OrganizeInventory extends Objective {

	constructor(private readonly options: IOriganizeInventoryOptions = { allowChests: true }) {
		super();
	}

	public getIdentifier(): string {
		return "OrganizeInventory";
	}

	public getStatus(): string {
		return "Organizing inventory";
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const reservedItems = getReservedItems(context);
		const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		let unusedItems = getUnusedItems(context);
		const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		if (reservedItems.length === 0 && unusedItems.length === 0 && !this.options.items) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.onlyIfNearBase && !isNearBase(context)) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.items) {
			const validItems = this.options.items.filter(item => itemManager.getPlayerWithItemInInventory(item) === context.player);
			if (validItems.length === 0) {
				return ObjectiveResult.Ignore;
			}

			this.log.info("Moving items", this.options.items);

			const objectivePipelines: IObjective[][] = [];

			const chests = this.options.onlyAllowIntermediateChest ? context.base.intermediateChest : context.base.chest;

			for (const chest of chests) {
				const objectives = OrganizeInventory.moveIntoChestObjectives(context, chest, validItems);
				if (objectives) {
					objectivePipelines.push(objectives);
				}
			}

			return objectivePipelines;
		}

		const allowOrganizingReservedItemsIntoIntermediateChest = context.getData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest) !== false;

		this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow moving reserved items: ${this.options?.allowReservedItems}. Allow moving into chests: ${this.options?.allowChests}. Allow moving into intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);

		if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
			this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);

			// move them into the intermediate chest
			const objectives = OrganizeInventory.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
			if (objectives) {
				return objectives;
			}
		}

		if (unusedItems.length === 0 && this.options.allowReservedItems) {
			// ignore reserved items
			unusedItems = getUnusedItems(context, true);
		}

		if (unusedItems.length === 0) {
			return ObjectiveResult.Ignore;
		}

		// if (!isNearBase(context)) {
		// 	this.log.info(`Not near base, disabling use of chests.. ${unusedItems.join(", ")}`, context.getHashCode());
		// 	this.options.allowChests = false;
		// }

		this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());

		if (this.options.allowChests && context.base.chest.length > 0) {
			// pick the chest with the most room available
			const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a as IContainer) - itemManager.computeContainerWeight(b as IContainer));
			for (const chest of chests) {
				if (!this.options.disableDrop && Vector2.distance(context.player, chest) > maxChestDistance) {
					continue;
				}

				const objectives = OrganizeInventory.moveIntoChestObjectives(context, chest, unusedItems);
				if (objectives) {
					return objectives;
				}
			}
		}

		if (this.options.disableDrop) {
			return ObjectiveResult.Impossible;
		}

		const target = TileHelpers.findMatchingTile(context.player, (point, tile) => isOpenTile(context, point, tile) && !game.isTileFull(tile), defaultMaxTilesChecked);
		if (target === undefined) {
			return ObjectiveResult.Impossible;
		}

		const itemToDrop = unusedItems[0];

		this.log.info(`Dropping ${itemToDrop}`);

		return [
			new MoveToTarget(target, false),
			new ExecuteAction(ActionType.Drop, (context, action) => {
				action.execute(context.player, itemToDrop);
			}),
		];
	}

	public static moveIntoChestsObjectives(context: Context, itemsToMove: Item[]) {
		const chests = context.base.chest.slice().concat(context.base.intermediateChest);

		for (const chest of chests) {
			const organizeInventoryObjectives = OrganizeInventory.moveIntoChestObjectives(context, chest, itemsToMove);
			if (organizeInventoryObjectives) {
				return organizeInventoryObjectives;
			}
		}

		return undefined;
	}

	private static moveIntoChestObjectives(context: Context, chest: Doodad, itemsToMove: Item[]) {
		const targetContainer = chest as IContainer;
		const weight = itemManager.computeContainerWeight(targetContainer);
		if (weight + itemsToMove[0].getTotalWeight() <= itemManager.getWeightCapacity(targetContainer)!) {
			// at least 1 item fits in the chest
			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(chest, true));

			for (const item of itemsToMove) {
				objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
					action.execute(context.player, item, targetContainer);
				}));
			}

			return objectives;
		}

		return undefined;
	}

}
