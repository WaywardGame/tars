import { VehicleType } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type Tile from "@wayward/game/game/tile/Tile";
import { TileEventType } from "@wayward/game/game/tile/ITileEvent";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Restart from "../core/Restart";
import MoveItemsIntoInventory from "../other/item/MoveItemsIntoInventory";

export default class OrganizeBase extends Objective {

	constructor(private readonly tiles: Tile[]) {
		super();
	}

	public getIdentifier(): string {
		return "OrganizeBase";
	}

	public getStatus(): string | undefined {
		return "Organizing base";
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.tiles.length === 0) {
			return ObjectiveResult.Ignore;
		}

		if (context.base.chest.length === 0) {
			return ObjectiveResult.Impossible;
		}

		const objectivePipelines: IObjective[][] = [];

		for (const tile of this.tiles) {
			if (!tile.containedItems || tile.containedItems.length === 0) {
				continue;
			}

			if (tile.doodad?.description?.providesFire || tile.doodad?.description?.isTrap) {
				continue;
			}

			if (context.island.tileEvents.getFromTile(tile, TileEventType.Fire) || context.island.tileEvents.getFromTile(tile, TileEventType.Acid)) {
				continue;
			}

			let weight = context.utilities.player.getWeight(context);
			const maxWeight = context.utilities.player.getMaxWeight(context);
			const itemsToMove: Item[] = [];

			for (const item of tile.containedItems) {
				if (item.description?.vehicle?.type === VehicleType.Boat) {
					// don't organize boats
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

			// pick up items from tile
			objectives.push(new MoveItemsIntoInventory(itemsToMove, tile));

			// restart now
			// the ReduceWeight interrupt will eventually handle moving items into chests
			// this makes it so OrganizeBase will keep picking up the nearest items until the inventory is full
			objectives.push(new Restart());

			objectivePipelines.push(objectives);

			// move items into chest
			// objectives.push(new MoveToTarget(chests[0], true));

			// for (const item of tile.containedItems) {
			// 	objectives.push(new ExecuteAction(MoveItem, (context) => {
			// 		action.execute(context.actionExecutor, item, chests[0] as IContainer);
			// 	}));
			// }
		}

		if (objectivePipelines.length === 0) {
			return ObjectiveResult.Complete;
		}

		return objectivePipelines;
	}

}
