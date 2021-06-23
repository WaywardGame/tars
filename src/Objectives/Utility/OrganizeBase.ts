import { IContainer, ItemType } from "game/item/IItem";
import { IVector3 } from "utilities/math/IVector";
import Item from "game/item/Item";
import { TileEventType } from "game/tile/ITileEvent";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { playerUtilities } from "../../utilities/Player";
import MoveToTarget from "../core/MoveToTarget";
import Restart from "../core/Restart";
import MoveItem from "../other/item/MoveItem";

export default class OrganizeBase extends Objective {

	constructor(private readonly tiles: IVector3[]) {
		super();
	}

	public getIdentifier(): string {
		return "OrganizeBase";
	}

	public getStatus(): string {
		return "Organizing base";
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.tiles.length === 0) {
			return ObjectiveResult.Ignore;
		}

		// pick the chest with the most room available
		const chests = context.base.chest.slice().sort((a, b) => itemManager.computeContainerWeight(a as IContainer) - itemManager.computeContainerWeight(b as IContainer));
		if (chests.length === 0) {
			return ObjectiveResult.Impossible;
		}

		const objectivePipelines: IObjective[][] = [];

		for (const position of this.tiles) {
			const tile = game.getTileFromPoint(position);
			if (tile.containedItems && tile.containedItems.length > 0 && !tileEventManager.get(tile, TileEventType.Fire)) {
				let weight = playerUtilities.getWeight(context);
				const maxWeight = playerUtilities.getMaxWeight(context);
				const itemsToMove: Item[] = [];

				for (const item of tile.containedItems) {
					if (item.type === ItemType.Sailboat) {
						// don't organize sailboats
						continue;
					}

					const itemWeight = item.getTotalWeight();
					if (weight + itemWeight <= maxWeight) {
						weight += itemWeight;
						itemsToMove.push(item);
					}
				}

				if (itemsToMove.length === 0) {
					continue;
				}

				const objectives: IObjective[] = [];

				// pickup items from tile
				objectives.push(new MoveToTarget(position, true));

				for (const item of itemsToMove) {
					objectives.push(new MoveItem(item, context.player.inventory));
				}

				// restart now
				// the ReduceWeight interrupt will eventually handle moving items into chests
				// this makes it so OrganizeBase will keep picking up the nearest items until the inventory is full
				objectives.push(new Restart());

				objectivePipelines.push(objectives);

				// move items into chest
				// objectives.push(new MoveToTarget(chests[0], true));

				// for (const item of tile.containedItems) {
				// 	objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
				// 		action.execute(context.player, item, chests[0] as IContainer);
				// 	}));
				// }
			}
		}

		return objectivePipelines;
	}

}
