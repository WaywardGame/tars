import { IStat, Stat } from "game/entity/IStats";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { playerUtilities } from "../../utilities/Player";
import { tileUtilities } from "../../utilities/Tile";
import Idle from "../other/Idle";
import Rest from "../other/Rest";

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

		if (tileUtilities.isSwimmingOrOverWater(context) && playerUtilities.isUsingVehicle(context)) {
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
