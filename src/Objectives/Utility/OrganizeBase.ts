import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import { IContainer } from "game/item/IItem";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

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

		const objectives: IObjective[] = [];

		for (const position of this.tiles) {
			const tile = game.getTileFromPoint(position);
			if (tile.containedItems && tile.containedItems.length > 0) {
				// const objectives: IObjective[] = [];

				// pickup items from tile
				objectives.push(new MoveToTarget(position, true));

				for (const item of tile.containedItems) {
					objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
						action.execute(context.player, item, context.player.inventory);
					}));
				}

				// move items into chest
				objectives.push(new MoveToTarget(chests[0], true));

				for (const item of tile.containedItems) {
					objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
						action.execute(context.player, item, chests[0] as IContainer);
					}));
				}

				// objectivePipelines.push(objectives);
			}
		}

		return objectives;
	}

	public static moveIntoChestObjectives(chest: Doodad, itemsToMove: Item[]) {
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
