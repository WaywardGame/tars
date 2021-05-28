import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import Item from "game/item/Item";
import { getTileId } from "utilities/game/TilePosition";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherWaterFromWell extends Objective {

	constructor(private readonly well: Doodad, private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromWell:${this.well}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const pos = this.well.getPoint();

		const wellData = island.wellData[getTileId(pos.x, pos.y, pos.z)];
		if (!wellData || wellData.quantity === 0) {
			return ObjectiveResult.Impossible;
		}

		return [
			new MoveToTarget(this.well, true),
			new ExecuteAction(ActionType.UseItem, (context, action) => {
				action.execute(context.player, this.item, ActionType.GatherWater);
			}).setStatus(() => `Gathering water from ${this.well.getName()}`),
		];
	}
}
