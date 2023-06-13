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

import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type Context from "../core/context/Context";

export class PlayerUtilities {

	public getWeight(context: Context) {
		return context.human.stat.get<IStatMax>(Stat.Weight).value;
	}

	public getMaxWeight(context: Context) {
		return context.human.stat.get<IStatMax>(Stat.Weight).max;
	}

	public isUsingVehicle(context: Context) {
		return !!context.human.vehicleItemReference;
	}

	public isHealthy(context: Context) {
		return context.human.stat.get<IStatMax>(Stat.Health).value > 8 && context.human.stat.get<IStatMax>(Stat.Hunger).value > 8;
	}

	public getRecoverThreshold(context: Context, stat: Stat) {
		let recoverThreshold: number | number[];

		switch (stat) {
			case Stat.Health:
				recoverThreshold = context.options.recoverThresholdHealth;
				break;

			case Stat.Stamina:
				recoverThreshold = context.options.recoverThresholdStamina;
				break;

			case Stat.Hunger:
				recoverThreshold = context.options.recoverThresholdHunger;
				break;

			case Stat.Thirst:
				recoverThreshold = [context.options.recoverThresholdThirst, context.options.recoverThresholdThirstFromMax];
				break;

			default:
				throw new Error(`Invalid recover threshold stat ${stat}`);
		}

		if (Array.isArray(recoverThreshold)) {
			recoverThreshold = Math.min(...recoverThreshold.map((threshold) => this.parseThreshold(context, stat, threshold)));
		} else {
			recoverThreshold = this.parseThreshold(context, stat, recoverThreshold);
		}

		return recoverThreshold;
	}

	private parseThreshold(context: Context, stat: Stat, threshold: number) {
		return threshold > 0 ? threshold : context.human.stat.get<IStatMax>(stat).max + threshold;
	}
}
