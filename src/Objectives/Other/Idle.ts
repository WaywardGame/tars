import { ActionType } from "entity/action/IAction";
import { TurnMode } from "game/IGame";
import TileHelpers from "utilities/TileHelpers";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { defaultMaxTilesChecked } from "../../ITars";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";

export default class Idle extends Objective {

	constructor(private readonly canMoveToIdle: boolean = true) {
		super();
	}

	public getIdentifier(): string {
		return "Idle";
	}

	public getStatus(): string {
		return "Idling";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[] = [];

		if (game.getTurnMode() === TurnMode.RealTime ||
			game.nextTickTime === 0 ||
			(game.lastTickTime !== undefined && (game.lastTickTime + (game.getTickSpeed() * game.interval) + 200) > game.absoluteTime)) {
			// don't idle in realtime mode or in simulated mode if the turns are ticking still. +200ms buffer for ping
			objectivePipelines.push(new Lambda(async (context, lambda) => {
				lambda.log.info("Smart idling");
				return ObjectiveResult.Complete;
			}).setStatus(this));

		} else {
			if (this.canMoveToIdle) {
				const target = TileHelpers.findMatchingTile(context.player, (_, tile) => (!tile.containedItems || tile.containedItems.length === 0) && !game.isTileFull(tile) && !tile.doodad, defaultMaxTilesChecked);
				if (target) {
					this.log.info("Moving to idle position");

					objectivePipelines.push(new MoveToTarget(target, false));
				}
			}

			objectivePipelines.push(new ExecuteAction(ActionType.Idle, (context, action) => {
				action.execute(context.player);
			}).setStatus(this));
		}

		// always Restart the objective after idling
		// idling usually implies we're waiting for something. we don't want to automatically continue running the next objective in the pipeline
		objectivePipelines.push(new Lambda(async () => ObjectiveResult.Restart).setStatus(this));

		return objectivePipelines;
	}

	protected getBaseDifficulty() {
		return 1;
	}
}
