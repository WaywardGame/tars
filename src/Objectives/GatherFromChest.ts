import { ActionType } from "action/IAction";
import { ItemType } from "Enums";
import { IContainer } from "item/IItem";
import { ITile } from "tile/ITerrain";
import Vector2 from "utilities/math/Vector2";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { MoveResult, moveToTargetWithRetries } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class GatherFromChest extends Objective {

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getHashCode(): string {
		return `GatherFromChest:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (base.chests === undefined || base.chests.length === 0) {
			if (calculateDifficulty) {
				return missionImpossible;
			}

			return ObjectiveStatus.Complete;
		}

		const chestsWithItem = base.chests.filter(c => itemManager.getItemsInContainerByType(c as IContainer, this.itemType, true).length > 0).sort((a, b) => Vector2.squaredDistance(localPlayer, a) > Vector2.squaredDistance(localPlayer, b) ? 1 : -1);

		const chest = chestsWithItem[0];

		if (calculateDifficulty) {
			return chest === undefined ? missionImpossible : Math.round(Vector2.squaredDistance(localPlayer, chest));
		}

		if (chest === undefined) {
			return ObjectiveStatus.Complete;
		}

		const moveResult = await moveToTargetWithRetries((ignoredTiles: ITile[]) => {
			for (let i = 0; i < chestsWithItem.length; i++) {
				const target = chestsWithItem[i];
				const targetTile = target.getTile();
				if (ignoredTiles.indexOf(targetTile) === -1) {
					return target;
				}
			}

			return undefined;
		});
		if (moveResult === MoveResult.NoTarget) {
			this.log.info("Can't gather from chest nearby");
			return ObjectiveStatus.Complete;

		} else if (moveResult !== MoveResult.Complete) {
			return;
		}

		const item = itemManager.getItemsInContainerByType(chest as IContainer, this.itemType, true)[0];
		if (!item) {
			this.log.warn("gather from chest bug?");
			return ObjectiveStatus.Complete;
		}

		return new ExecuteAction(ActionType.MoveItem, action => action.execute(localPlayer, item, undefined, localPlayer.inventory));
	}
}
