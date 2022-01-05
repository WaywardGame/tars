import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";

import Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { anyWaterTileLocation } from "../../core/navigation/INavigation";
import Objective from "../../core/objective/Objective";
import { tileUtilities } from "../../utilities/Tile";
import MoveToTarget from "../core/MoveToTarget";
import UseItem from "../other/item/UseItem";
import PickUpAllTileItems from "../other/tile/PickUpAllTileItems";

export default class GatherWaterFromTerrain extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromTerrain:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Gathering water into ${this.item.getName()} from terrain`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const targets = await tileUtilities.getNearestTileLocation(context, anyWaterTileLocation);

		for (const { tile, point } of targets) {
			if (tile.creature || tile.npc || context.island.isPlayerAtTile(tile)) {
				continue;
			}

			objectivePipelines.push([
				new MoveToTarget(point, true),
				new PickUpAllTileItems(point),
				new UseItem(ActionType.GatherLiquid, this.item)
					.setStatus("Gathering water from terrain"),
			]);
		}

		return objectivePipelines;
	}
}
