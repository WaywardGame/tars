import { IStat, Stat } from "entity/IStats";
import { isUsingVehicle } from "src/Utilities/Player";
import { isOverWater } from "src/Utilities/Tile";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import Idle from "../Other/Idle";
import Rest from "../Other/Rest";

export default class RecoverStamina extends Objective {

	public getIdentifier(): string {
		return "RecoverStamina";
	}

	public getStatus(): string {
		return "Recovering stamina";
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

		if (isOverWater(context) && isUsingVehicle(context)) {
			this.log.info("Idling to recover stamina");
			return new Idle(false);
		}

		// if (context.player.getWeightStatus() !== WeightStatus.Overburdened &&
		// 	(context.player.stat.get<IStat>(Stat.Hunger).value <= 0 || context.player.stat.get<IStat>(Stat.Thirst).value <= 0)) {
		// 	this.log.info("Can't rest now");
		// 	return ObjectiveResult.Complete;
		// }

		if (context.player.stat.get<IStat>(Stat.Thirst).value < 1) {
			this.log.info("Can't rest now, too thirsty");
			return ObjectiveResult.Complete;
		}

		if (context.player.stat.get<IStat>(Stat.Hunger).value < 1) {
			this.log.info("Can't rest now, too hungry");
			return ObjectiveResult.Complete;
		}

		return new Rest(true);
	}

}
