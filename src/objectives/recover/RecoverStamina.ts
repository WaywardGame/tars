/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type { IStat } from "@wayward/game/game/entity/IStats";
import { Stat } from "@wayward/game/game/entity/IStats";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import Idle from "../other/Idle";
import Rest from "../other/Rest";

export default class RecoverStamina extends Objective {

	public getIdentifier(): string {
		return "RecoverStamina";
	}

	public getStatus(): string | undefined {
		return "Recovering stamina";
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.human.status.Poisoned || context.human.status.Burned) {
			if (context.human.stat.get<IStat>(Stat.Stamina).value <= 1) {
				// emergency. wait it out
				this.log.info("Emergency idling");
				return new Idle({ canMoveToIdle: false });
			}

			return ObjectiveResult.Complete;
		}

		if (context.utilities.tile.isSwimmingOrOverWater(context) && context.utilities.player.isUsingVehicle(context)) {
			this.log.info("Idling to recover stamina");
			return new Idle({ canMoveToIdle: false });
		}

		// if (context.player.getWeightStatus() !== WeightStatus.Overburdened &&
		// 	(context.player.stat.get<IStat>(Stat.Hunger).value <= 0 || context.player.stat.get<IStat>(Stat.Thirst).value <= 0)) {
		// 	this.log.info("Can't rest now");
		// 	return ObjectiveResult.Complete;
		// }

		if (context.human.stat.get<IStat>(Stat.Thirst).value < 1) {
			this.log.info("Can't rest now, too thirsty");
			return ObjectiveResult.Complete;
		}

		if (context.human.stat.get<IStat>(Stat.Hunger).value < 1) {
			this.log.info("Can't rest now, too hungry");
			return ObjectiveResult.Complete;
		}

		return new Rest(true);
	}

}
