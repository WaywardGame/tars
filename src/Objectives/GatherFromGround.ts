import { ActionType } from "action/IAction";
import { ItemType } from "Enums";
import { ITile } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import Vector2 from "utilities/math/Vector2";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { desertCutoff, IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { MoveResult, moveToFaceTargetWithRetries } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class GatherFromGround extends Objective {

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getHashCode(): string {
		return `GatherFromGround:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const itemsOnTheGround = game.items
			.filter(item => {
				if (item && item.type === this.itemType && itemManager.isTileContainer(item.containedWithin)) {
					const container = (item.containedWithin as any as IVector3);
					return container.z === localPlayer.z && container.y < desertCutoff;
				}

				return false;
			})
			.sort((a, b) => Vector2.squaredDistance(localPlayer, a.containedWithin as any as IVector3) > Vector2.squaredDistance(localPlayer, b.containedWithin as any as IVector3) ? 1 : -1);

		if (calculateDifficulty) {
			const target = itemsOnTheGround[0];
			return target === undefined ? missionImpossible : Math.round(Vector2.squaredDistance(localPlayer, target.containedWithin as any as IVector3));
		}

		if (itemsOnTheGround.length > 0) {
			const tile = localPlayer.getTile();
			if (tile.containedItems !== undefined && tile === itemsOnTheGround[0].containedWithin as ITile) {
				const pickupItem = tile.containedItems[tile.containedItems.length - 1];
				if (pickupItem.type === this.itemType) {
					return new ExecuteAction(ActionType.Idle, action => action.execute(localPlayer));
				}
			}
		}

		const moveResult = await moveToFaceTargetWithRetries((ignoredTiles: ITile[]) => {
			for (let i = 0; i < itemsOnTheGround.length; i++) {
				const target = itemsOnTheGround[i];
				const targetTile = target.containedWithin as ITile;
				if (ignoredTiles.indexOf(targetTile) === -1) {
					return targetTile as IVector3;
				}
			}

			return undefined;
		});
		if (moveResult === MoveResult.NoTarget) {
			this.log.info("Can't find ground tile nearby");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.NoPath) {
			this.log.info("Can't find path to ground tile");
			return ObjectiveStatus.Complete;
		}

		if (moveResult !== MoveResult.Complete) {
			return;
		}

		const facingTile = localPlayer.getFacingTile();
		if (facingTile.containedItems !== undefined && facingTile.containedItems[facingTile.containedItems.length - 1].type === this.itemType) {
			return new ExecuteAction(ActionType.PickupItem, action => action.execute(localPlayer));
		}

		return new ExecuteAction(ActionType.PickupAllItems, action => action.execute(localPlayer));
	}

	protected getBaseDifficulty(base: IBase, inventory: IInventoryItems): number {
		return 6;
	}

}
