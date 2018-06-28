import { ActionType } from "Enums";
import { IContainer } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

const maxChestDistance = 128;

export default class OrganizeInventory extends Objective {

	constructor(private fromReduceWeightInterrupt: boolean, private allowChests: boolean = true) {
		super();
	}

	public shouldSaveChildObjectives(): boolean {
		return false;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		let unusedItems = Helpers.getUnusedItems(inventory);

		const unusedExtraItems = unusedItems.filter(item => unusedItems.filter(i => i.type === item.type).length >= 3);
		if (unusedExtraItems.length > 0) {
			unusedItems = unusedExtraItems;

		} else if (!this.fromReduceWeightInterrupt) {
			return ObjectiveStatus.Complete;
		}

		if (unusedItems.length === 0) {
			return ObjectiveStatus.Complete;
		}

		const itemToDrop = unusedItems[0];

		let moveResult: MoveResult;

		if (this.allowChests && base.chests !== undefined && base.chests.length > 0) {
			const chests = base.chests.sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);
			for (const chest of chests) {
				if (Vector2.squaredDistance(localPlayer, chest) > maxChestDistance) {
					continue;
				}

				const container = chest as IContainer;
				if (itemManager.computeContainerWeight(container) + itemToDrop.weight > container.weightCapacity!) {
					continue;
				}

				moveResult = await Helpers.moveToTarget(chest);
				if (moveResult === MoveResult.NoPath) {
					continue;
				}

				if (moveResult !== MoveResult.Complete) {
					this.log.info("Moving");
					return;
				}

				this.log.info(`Moving item ${game.getName(itemToDrop)} into chest`);

				return new ExecuteAction(ActionType.MoveItem, {
					item: itemToDrop,
					targetContainer: container
				}, false);
			}
		}

		moveResult = await Helpers.findAndMoveToTarget((point: IVector3, tile: ITile) => Helpers.isOpenTile(point, tile) && !game.isTileFull(tile), true);
		if (moveResult !== MoveResult.Complete) {
			this.log.info("Moving to drop position");
			return;
		}

		return new ExecuteAction(ActionType.Drop, {
			item: itemToDrop
		});
	}

}
