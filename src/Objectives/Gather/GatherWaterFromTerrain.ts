import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { anyWaterTileLocation } from "../../navigation//INavigation";
import Objective from "../../Objective";
import { tileUtilities } from "../../utilities/Tile";
import ExecuteAction from "../core/ExecuteAction";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherWaterFromTerrain extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromTerrain:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = await tileUtilities.getNearestTileLocation(context, anyWaterTileLocation);

		for (const { tile, point } of targets) {
			if (tile.creature || tile.npc || game.isPlayerAtTile(tile)) {
				continue;
			}

			const objectives: IObjective[] = [];

			objectives.push(new MoveToTarget(point, true));

			objectives.push(new Lambda(async (context: Context) => {
				const objectives: IObjective[] = [];

				if (game.isTileFull(context.player.getFacingTile())) {
					for (const item of tile.containedItems!) {
						objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
							action.execute(context.player, item, context.player.inventory);
						}));
					}
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
