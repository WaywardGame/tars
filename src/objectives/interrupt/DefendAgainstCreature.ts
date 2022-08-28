import type Creature from "game/entity/creature/Creature";
import type { IStat } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import HuntCreature from "../other/creature/HuntCreature";
import RunAwayFromTarget from "../other/RunAwayFromTarget";

export default class DefendAgainstCreature extends Objective {

	constructor(private readonly creature: Creature, private readonly shouldRunAway: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `DefendAgainstCreature:${this.creature}:${this.shouldRunAway}`;
	}

	public getStatus(): string | undefined {
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

		objectivePipelines.push([new HuntCreature(creature, false)]);

		return objectivePipelines;
	}
}
