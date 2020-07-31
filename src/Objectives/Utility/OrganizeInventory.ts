import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";
import { IContainer } from "item/IItem";
import Item from "item/Item";
import Vector2 from "utilities/math/Vector2";
import TileHelpers from "utilities/TileHelpers";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Objective from "../../Objective";
import { isNearBase } from "../../Utilities/Base";
import { getReservedItems, getUnusedItems } from "../../Utilities/Item";
import { isOpenTile } from "../../Utilities/Tile";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

const maxChestDistance = 128;

export default class OrganizeInventory extends Objective {

	constructor(private allowChests: boolean = true, private readonly force: boolean = false) {
		super();
	}

	public getIdentifier(): string {
		return "OrganizeInventory";
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

		if (reservedItems.length === 0 && unusedItems.length === 0) {
			return ObjectiveResult.Ignore;
		}

		const allowOrganizingReservedItemsIntoIntermediateChest = context.getData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest) !== false;

		this.log.info(`Reserved items weight: ${reservedItemsWeight}. Unused items weight: ${unusedItemsWeight}. Allow intermediate chest: ${allowOrganizingReservedItemsIntoIntermediateChest}`);

		if (context.base.intermediateChest[0] && allowOrganizingReservedItemsIntoIntermediateChest && reservedItems.length > 0 && reservedItemsWeight >= unusedItemsWeight) {
			this.log.info(`Going to move reserved items into intermediate chest. ${reservedItems.join(", ")}`);

			// move them into the intermediate chest
			const objectives = this.moveIntoChestObjectives(context, context.base.intermediateChest[0], reservedItems);
			if (objectives) {
				return objectives;
			}
		}

		if (unusedItems.length === 0 && this.force) {
			// ignore reserved items
			unusedItems = getUnusedItems(context, true);
		}

		if (unusedItems.length === 0) {
			return ObjectiveResult.Ignore;
		}

		if (!isNearBase(context)) {
			this.log.info(`Not near base, disabling use of chests.. ${unusedItems.join(", ")}`, context.getHashCode());
			this.allowChests = false;
		}

		this.log.info(`Unused items. ${unusedItems.join(", ")}`, context.getHashCode());

		if (this.allowChests && context.base.chest.length > 0) {
			// pick the chest with the most room available
			const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a as IContainer) > itemManager.computeContainerWeight(b as IContainer) ? 1 : -1);
			for (const chest of chests) {
				if (Vector2.distance(context.player, chest) > maxChestDistance) {
					continue;
				}

				const objectives = this.moveIntoChestObjectives(context, chest, unusedItems);
				if (objectives) {
					return objectives;
				}
			}
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

	private moveIntoChestObjectives(context: Context, chest: Doodad, itemsToMove: Item[]) {
		const targetContainer = chest as IContainer;
		const weight = itemManager.computeContainerWeight(targetContainer);
		if (weight + itemsToMove[0].getTotalWeight() <= targetContainer.weightCapacity!) {
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
