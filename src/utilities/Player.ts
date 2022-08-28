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
