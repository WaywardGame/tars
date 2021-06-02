import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { IStat, Stat } from "game/entity/IStats";
import { getDirectionFromMovement } from "game/entity/player/IPlayer";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../core/ExecuteAction";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";
import Restart from "../core/Restart";
import RunAwayFromTarget from "../other/RunAwayFromTarget";

export default class DefendAgainstCreature extends Objective {

	constructor(private readonly creature: Creature, private readonly shouldRunAway: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `DefendAgainstCreature:${this.creature}:${this.shouldRunAway}`;
	}

	public getStatus(): string {
		return `Defending against ${this.creature.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const creature = this.creature;
		if (creature.stat.get<IStat>(Stat.Health).value <= 0 || !creature.isValid() || creature.isTamed()) {
			return ObjectiveResult.Restart;
		}

		// use pipelines for the run away logic
		// that way, if it's impossible to run away, it will fight
		const objectivePipelines: IObjective[][] = [];

		if (this.shouldRunAway) {
			this.log.info("Running away from creature instead of defending");
			objectivePipelines.push([new RunAwayFromTarget(creature)]);
		}

		objectivePipelines.push([
			new MoveToTarget(creature, true),
			new Lambda(async context => {
				const direction = getDirectionFromMovement(creature.x - context.player.x, creature.y - context.player.y);

				return new ExecuteAction(ActionType.Move, (context, action) => {
					action.execute(context.player, direction);
				});
			}),
			new Restart(), // ensures that no other objectives are ran after this one
		]);

		return objectivePipelines;
	}
}
