import { ActionType } from "entity/action/IAction";
import Creature from "entity/creature/Creature";
import { CreatureType } from "entity/creature/ICreature";
import { IStat, IStatMax, Stat } from "entity/IStats";
import { getDirectionFromMovement, WeightStatus } from "entity/player/IPlayer";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import RunAwayFromTarget from "../Other/RunAwayFromTarget";

export default class DefendAgainstCreature extends Objective {

	constructor(private readonly creature: Creature) {
		super();
	}

	public getIdentifier(): string {
		return `DefendAgainstCreature:${this.creature}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const creature = this.creature;
		if (creature.stat.get<IStat>(Stat.Health).value <= 0 || !creature.isValid()) {
			return ObjectiveResult.Complete;
		}

		// use pipelines for the run away logic
		// that way, if it's impossible to run away, it will fight
		const objectivePipelines: IObjective[][] = [];

		if (context.player.getWeightStatus() !== WeightStatus.Overburdened) {
			const health = context.player.stat.get<IStatMax>(Stat.Health);
			const stamina = context.player.stat.get<IStatMax>(Stat.Stamina);
			if ((health.value / health.max) <= 0.15 || creature.type === CreatureType.Shark || stamina.value <= 2) {
				this.log.info("Running away from target");
				objectivePipelines.push([new RunAwayFromTarget(creature)]);
			}
		}

		objectivePipelines.push([
			new MoveToTarget(creature, true),
			new Lambda(async context => {
				const direction = getDirectionFromMovement(creature.x - context.player.x, creature.y - context.player.y);

				return new ExecuteAction(ActionType.Move, (context, action) => {
					action.execute(context.player, direction);
				});
			}),
			new Lambda(async () => ObjectiveResult.Restart), // ensures that no other objectives are ran after this one
		]);

		return objectivePipelines;
	}
}
