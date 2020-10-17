import { ActionType } from "entity/action/IAction";
import Item from "item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { anyWaterTileLocation } from "../../Navigation/INavigation";
import Objective from "../../Objective";
import { getNearestTileLocation } from "../../Utilities/Tile";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";

export default class GatherWaterFromTerrain extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromTerrain:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = await getNearestTileLocation(context, anyWaterTileLocation);

		for (const { tile, point } of targets) {
			if (tile.creature || tile.npc || game.isPlayerAtTile(tile)) {
				continue;
			}

			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(point, true));

			objectives.push(new Lambda(async (context: Context) => {
				const objectives: IObjective[] = [];

				if (game.isTileFull(context.player.getFacingTile())) {
					objectives.push(new ExecuteAction(ActionType.PickupAllItems, (context, action) => {
						action.execute(context.player);
					}).setStatus("Picking up all items from full tile"));
				}

				objectives.push(new ExecuteAction(ActionType.UseItem, (context, action) => {
					action.execute(context.player, this.item, ActionType.GatherWater);
				}).setStatus("Gathering water from terrain"));

				return objectives;
			}));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}
}
