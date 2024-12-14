import IdleAction from "@wayward/game/game/entity/action/actions/Idle";
import { TurnMode } from "@wayward/game/game/IGame";

import type Context from "../../core/context/Context";
import { defaultMaxTilesChecked } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteAction from "../core/ExecuteAction";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";
import Restart from "../core/Restart";

export interface IIdleOptions {
	force: boolean;
	canMoveToIdle: boolean;
}

export default class Idle extends Objective {

	constructor(private readonly options?: Partial<IIdleOptions>) {
		super();
	}

	public getIdentifier(): string {
		return `Idle:${this.options?.force}:${this.options?.canMoveToIdle}`;
	}

	public getStatus(): string | undefined {
		return "Idling";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[] = [];

		if (!this.options?.force &&
			(game.getTurnMode() === TurnMode.RealTime ||
				context.island.simulatedTickHelper.hasScheduledTick ||
				!context.island.simulatedTickHelper.hasTimePassedSinceLastTick((game.getTickSpeed() * game.interval) + 200, game.absoluteTime))) {
			// don't idle in realtime mode or in simulated mode if the turns are ticking still. +200ms buffer for ping
			objectivePipelines.push(new Lambda(async (context, lambda) => {
				lambda.log.info("Smart idling");
				return ObjectiveResult.Complete;
			}).setStatus(this));

		} else {
			if (this.options?.canMoveToIdle) {
				const target = context.human.tile.findMatchingTile(tile => (!tile.containedItems || tile.containedItems.length === 0) && !tile.isFull && !tile.doodad, { maxTilesChecked: defaultMaxTilesChecked });
				if (target) {
					this.log.info("Moving to idle position");

					objectivePipelines.push(new MoveToTarget(target, false));
				}
			}

			objectivePipelines.push(new ExecuteAction(IdleAction, []).setStatus(this));
		}

		// always Restart the objective after idling
		// idling usually implies we're waiting for something. we don't want to automatically continue running the next objective in the pipeline
		objectivePipelines.push(new Restart().setStatus(this));

		return objectivePipelines;
	}

	protected override getBaseDifficulty(): number {
		return 1;
	}
}
