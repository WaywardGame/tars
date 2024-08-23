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

import type Doodad from "@wayward/game/game/doodad/Doodad";
import type { IContainer } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import Vector2 from "@wayward/game/utilities/math/Vector2";
import Drop from "@wayward/game/game/entity/action/actions/Drop";

import { ContextDataType } from "../../core/context/IContext";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";
import Restart from "../core/Restart";
import MoveItemsFromContainer from "../other/item/MoveItemsFromContainer";
import { defaultMaxTilesChecked } from "../../core/ITars";

const maxChestDistance = 128;

export interface IOriganizeInventoryOptions {
	allowChests: boolean;

	disableDrop: boolean;

	onlyIfNearBase: boolean;

	allowReservedItems: boolean;
	allowInventoryItems: boolean;
	onlyOrganizeReservedItems: boolean;

	onlyAllowIntermediateChest: boolean;

	items: Item[];
}

export default class OrganizeInventory extends Objective {

	constructor(private readonly options: Partial<IOriganizeInventoryOptions> = { allowChests: true }) {
		super();
	}

	public getIdentifier(): string {
		return "OrganizeInventory";
	}

	public getStatus(): string | undefined {
		return "Organizing inventory";
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const reservedItems = context.utilities.item.getReservedItems(context, false)
			.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
		const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		let unusedItems = context.utilities.item.getUnusedItems(context)
			.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
		const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		const itemsToBuild = context.utilities.item.getItemsToBuild(context)
			.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
		const itemsToBuildWeight = itemsToBuild.reduce((a, b) => a + b.getTotalWeight(), 0);

		// console.log(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow moving reserved items: ${this.options?.allowReservedItems}. Allow moving into chests: ${this.options?.allowChests}.`, this.options);

		if (reservedItems.length === 0 && unusedItems.length === 0 && itemsToBuild.length === 0 && !this.options.items) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.onlyIfNearBase && !context.utilities.base.isNearBase(context)) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.items) {
			const validItems = this.options.items
				.filter(item => context.island.items.getPlayerWithItemInInventory(item) === context.human)
				.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
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

		this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Items to build weight: ${itemsToBuildWeight}. Allow moving reserved items: ${this.options?.allowReservedItems}. Allow moving into chests: ${this.options?.allowChests}. Allow moving into intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);

		if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
			this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);

			// move them into the intermediate chest
			const objectives = OrganizeInventory.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
			if (objectives) {
				return objectives;
			}
		}

		if (unusedItems.length === 0 && this.options.allowReservedItems) {
			unusedItems = context.utilities.item.getUnusedItems(context, { allowReservedItems: true });
		}

		if (unusedItems.length === 0 && this.options.allowInventoryItems) {
			unusedItems = unusedItems.concat(itemsToBuild);
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
			const chests = context.base.chest
				.slice()
				.sort((a, b) => context.island.items.computeContainerWeight(a as IContainer) - context.island.items.computeContainerWeight(b as IContainer));

			// prioritize the current facing chest
			const facingDoodad = context.human.facingTile.doodad;
			if (facingDoodad && context.island.items.isContainer(facingDoodad)) {
				const chestIndex = chests.indexOf(facingDoodad);
				if (chestIndex !== undefined) {
					chests.splice(chestIndex, 1);
					chests.unshift(facingDoodad);
				}
			}

			for (const chest of chests) {
				if (!this.options.disableDrop && Vector2.distance(context.human, chest) > maxChestDistance) {
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

		const itemToDrop = unusedItems[0];

		const target = context.human.tile.findMatchingTile(tile =>
			context.utilities.tile.isOpenTile(context, tile) &&
			Drop.canUseAt(context.human, { fromTile: tile, targetTile: tile }, itemToDrop).usable,
			{ maxTilesChecked: defaultMaxTilesChecked });
		if (target === undefined) {
			return ObjectiveResult.Impossible;
		}

		this.log.info(`Dropping ${itemToDrop}`);

		return [
			new MoveToTarget(target, false),
			new ExecuteAction(Drop, [itemToDrop]).setStatus(`Dropping ${itemToDrop.getName()}`),
		];
	}

	public static moveIntoChestsObjectives(context: Context, itemsToMove: Item[]): IObjective[] | undefined {
		const chests = context.base.chest.slice().concat(context.base.intermediateChest);

		for (const chest of chests) {
			const organizeInventoryObjectives = OrganizeInventory.moveIntoChestObjectives(context, chest, itemsToMove);
			if (organizeInventoryObjectives) {
				return organizeInventoryObjectives;
			}
		}

		return undefined;
	}

	private static moveIntoChestObjectives(context: Context, chest: Doodad, itemsToMove: Item[]): IObjective[] | undefined {
		const objectives: IObjective[] = [];

		const targetContainer = chest as IContainer;
		let chestWeight = context.island.items.computeContainerWeight(targetContainer);
		const chestWeightCapacity = context.island.items.getWeightCapacity(targetContainer);
		if (chestWeightCapacity !== undefined) {
			const itemsToMoveWithinWeight: Item[] = [];

			for (const item of itemsToMove) {
				const itemWeight = item.getTotalWeight(undefined, targetContainer);
				if (chestWeight + itemWeight > chestWeightCapacity) {
					break;
				}

				chestWeight += itemWeight;

				itemsToMoveWithinWeight.push(item);
			}

			if (itemsToMoveWithinWeight.length > 0) {
				// at least 1 item fits in the chest. move to it and start moving items
				objectives.push(new MoveToTarget(chest, true));

				objectives.push(new MoveItemsFromContainer(itemsToMoveWithinWeight, targetContainer));

				// restart in case there's more to move
				objectives.push(new Restart());
			}
		}

		return objectives.length > 0 ? objectives : undefined;
	}

}
