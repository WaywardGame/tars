import { IStat, Stat } from "entity/IStats";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import Idle from "../Other/Idle";
import Rest from "../Other/Rest";

export default class RecoverStamina extends Objective {

	public getIdentifier(): string {
		return "RecoverStamina";
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.player.status.Poisoned || context.player.status.Burned) {
			if (context.player.stat.get<IStat>(Stat.Stamina).value <= 1) {
				// emergency. wait it out
				this.log.info("Emergency idling");
				return new Idle(false);
			}

			return ObjectiveResult.Complete;
		}

		// if (context.player.getWeightStatus() !== WeightStatus.Overburdened &&
		// 	(context.player.stat.get<IStat>(Stat.Hunger).value <= 0 || context.player.stat.get<IStat>(Stat.Thirst).value <= 0)) {
		// 	this.log.info("Can't rest now");
		// 	return ObjectiveResult.Complete;
		// }

		return new Rest(true);
	}

}
