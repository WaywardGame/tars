import { ActionType } from "entity/action/IAction";
import TileHelpers from "utilities/TileHelpers";

import Context from "../../Context";
import { ObjectiveExecutionResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

export default class Idle extends Objective {

	constructor(private readonly move: boolean = true) {
		super();
	}

	public getIdentifier(): string {
		return "Idle";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.move) {
			const target = TileHelpers.findMatchingTile(context.player, (_, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, defaultMaxTilesChecked);
			if (target) {
				this.log.info("Moving to idle position");

				return [
					new MoveToTarget(target, false),
					new ExecuteAction(ActionType.Idle, (context, action) => {
						action.execute(context.player);
					}),
				];
			}
		}

		return new ExecuteAction(ActionType.Idle, (context, action) => {
			action.execute(context.player);
		});
	}

	protected getBaseDifficulty() {
		return 1;
	}
}
