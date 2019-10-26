import Doodad from "doodad/Doodad";
import { ActionType } from "entity/action/IAction";
import Item from "item/Item";

import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";
import StartWaterStillDesalination from "../Other/StartWaterStillDesalination";

export default class GatherWaterFromStill extends Objective {

	constructor(private readonly waterStill: Doodad, private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `GatherWaterFromStill:${this.waterStill}:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (!this.waterStill.gatherReady) {
			return new StartWaterStillDesalination(this.waterStill);
		}

		return [
			new MoveToTarget(this.waterStill, true),
			new ExecuteAction(ActionType.UseItem, (context, action) => {
				action.execute(context.player, this.item, ActionType.GatherWater);
			}),
		];
	}

}
