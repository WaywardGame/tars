import { ActionType } from "action/IAction";
import {  } from "Enums";
import { IContainer } from "item/IItem";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getUnusedItems } from "../Utilities/Item";
import { findAndMoveToTarget, MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import { isOpenTile } from "../Utilities/Tile";
import ExecuteAction from "./ExecuteAction";

const maxChestDistance = 128;

export default class OrganizeInventory extends Objective {

	constructor(private readonly fromReduceWeightInterrupt: boolean, private readonly allowChests: boolean = true) {
		super();
	}

	public getHashCode(): string {
		return "OrganizeInventory";
	}

	public shouldSaveChildObjectives(): boolean {
		return false;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		let unusedItems = getUnusedItems(inventory);

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
			const chests = base.chests.sort((a, b) => Vector2.distance(localPlayer, a) > Vector2.distance(localPlayer, b) ? 1 : -1);
			for (const chest of chests) {
				if (Vector2.distance(localPlayer, chest) > maxChestDistance) {
					continue;
				}

				const targetContainer = chest as IContainer;
				if (itemManager.computeContainerWeight(targetContainer) + itemToDrop.weight > targetContainer.weightCapacity!) {
					continue;
				}

				moveResult = await moveToFaceTarget(chest);
				if (moveResult === MoveResult.NoPath) {
					continue;
				}

				if (moveResult !== MoveResult.Complete) {
					this.log.info("Moving");
					return;
				}

				this.log.info(`Moving item ${itemToDrop.getName()} into chest`);

				return new ExecuteAction(ActionType.MoveItem, action => action.execute(localPlayer, itemToDrop, undefined, targetContainer), false);
			}
		}

		moveResult = await findAndMoveToTarget((point: IVector3, tile: ITile) => isOpenTile(point, tile) && !game.isTileFull(tile));
		if (moveResult !== MoveResult.Complete) {
			this.log.info("Moving to drop position");
			return;
		}

		return new ExecuteAction(ActionType.Drop, action => action.execute(localPlayer, itemToDrop));
	}

}
