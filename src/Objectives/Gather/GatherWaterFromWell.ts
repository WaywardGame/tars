import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";
import Item from "item/Item";
import { getTileId } from "utilities/TilePosition";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

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
			}),
		];
	}
}
