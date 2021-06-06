import { IStatMax, Stat } from "game/entity/IStats";

import Context from "../Context";

/**
 * can be negative, so -8 would mean (max - 8)
 * can be an array, which means the smaller number wins
 */
const recoverThresholds: { [index: number]: number | number[] } = {
	[Stat.Health]: 30,
	[Stat.Stamina]: 20,
	[Stat.Hunger]: 8,
	[Stat.Thirst]: [10, -10], // either 10 or (max - 10), whichever is smaller
};

class PlayerUtilities {

	public getWeight(context: Context) {
		return context.player.stat.get<IStatMax>(Stat.Weight).value;
	}

	public getMaxWeight(context: Context) {
		return context.player.stat.get<IStatMax>(Stat.Weight).max;
	}

	public isUsingVehicle(context: Context) {
		return context.player.vehicleItemId !== undefined;
	}

	public isHealthy(context: Context) {
		return context.player.stat.get<IStatMax>(Stat.Health).value > 8
			&& context.player.stat.get<IStatMax>(Stat.Hunger).value > 8;
	}

	public getRecoverThreshold(context: Context, stat: Stat) {
		let recoverThreshold = recoverThresholds[stat];

		if (Array.isArray(recoverThreshold)) {
			recoverThreshold = Math.min(...recoverThreshold.map((threshold) => this.parseThreshold(context, stat, threshold)));
		} else {
			recoverThreshold = this.parseThreshold(context, stat, recoverThreshold);
		}

		return recoverThreshold;
	}

	private parseThreshold(context: Context, stat: Stat, threshold: number) {
		return threshold > 0 ? threshold : context.player.stat.get<IStatMax>(stat).max + threshold;
	}
}

export const playerUtilities = new PlayerUtilities();
