import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import { IContainer } from "game/item/IItem";
import Item from "game/item/Item";
import TileHelpers from "utilities/game/TileHelpers";
import Vector2 from "utilities/math/Vector2";

import { ContextDataType, MovingToNewIslandState } from "../..//IContext";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Objective from "../../Objective";
import { baseUtilities } from "../../utilities/Base";
import { itemUtilities } from "../../utilities/Item";
import { tileUtilities } from "../../utilities/Tile";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";
import Restart from "../core/Restart";
import MoveItem from "../other/item/MoveItem";

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

	public getStatus(): string | undefined {
		return "Organizing inventory";
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const moveToNewIslandState = context.getDataOrDefault<MovingToNewIslandState>(ContextDataType.MovingToNewIsland, MovingToNewIslandState.None);

		const reservedItems = itemUtilities.getReservedItems(context)
			.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
		const reservedItemsWeight = reservedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		let unusedItems = itemUtilities.getUnusedItems(context, { allowSailboat: moveToNewIslandState === MovingToNewIslandState.None })
			.sort((a, b) => a.getTotalWeight() - b.getTotalWeight());
		const unusedItemsWeight = unusedItems.reduce((a, b) => a + b.getTotalWeight(), 0);

		if (reservedItems.length === 0 && unusedItems.length === 0 && !this.options.items) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.onlyIfNearBase && !baseUtilities.isNearBase(context)) {
			return ObjectiveResult.Ignore;
		}

		if (this.options.items) {
			const validItems = this.options.items
				.filter(item => itemManager.getPlayerWithItemInInventory(item) === context.player)
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
			unusedItems = itemUtilities.getUnusedItems(context, { allowReservedItems: true });
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

		const target = TileHelpers.findMatchingTile(context.player, (point, tile) => tileUtilities.isOpenTile(context, point, tile), { maxTilesChecked: defaultMaxTilesChecked });
		if (target === undefined) {
			return ObjectiveResult.Impossible;
		}

		const itemToDrop = unusedItems[0];

		this.log.info(`Dropping ${itemToDrop}`);

		return [
			new MoveToTarget(target, false),
			new ExecuteAction(ActionType.Drop, (context, action) => {
				action.execute(context.player, itemToDrop);
				return ObjectiveResult.Complete;
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
		const objectives: IObjective[] = [];

		const targetContainer = chest as IContainer;
		let chestWeight = itemManager.computeContainerWeight(targetContainer);
		const chestWeightCapacity = itemManager.getWeightCapacity(targetContainer);
		if (chestWeightCapacity !== undefined && chestWeight + itemsToMove[0].getTotalWeight() <= chestWeightCapacity) {
			// at least 1 item fits in the chest. move to it and start moving items
			objectives.push(new MoveToTarget(chest, true));

			for (const item of itemsToMove) {
				const itemWeight = item.getTotalWeight();
				if (chestWeight + itemWeight > chestWeightCapacity) {
					break;
				}

				chestWeight += itemWeight;

				objectives.push(new MoveItem(item, targetContainer, chest));
			}

			// restart in case there's more to move
			objectives.push(new Restart());
		}

		return objectives.length > 0 ? objectives : undefined;
	}

}
