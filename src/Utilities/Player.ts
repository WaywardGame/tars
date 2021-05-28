import { IStatMax, Stat } from "game/entity/IStats";

import Context from "../Context";

// can be negative. ex: -8 means [max - 8[]
const recoverThresholds: { [index: number]: number } = {
	[Stat.Health]: 30,
	[Stat.Stamina]: 20,
	[Stat.Hunger]: 8,
	[Stat.Thirst]: 10,
};

export function isHealthy(context: Context) {
	return context.player.stat.get<IStatMax>(Stat.Health).value > 8
		&& context.player.stat.get<IStatMax>(Stat.Hunger).value > 8;
}

export function isUsingVehicle(context: Context) {
	return context.player.vehicleItemId !== undefined;
}

export function getRecoverThreshold(context: Context, stat: Stat) {
	const recoverThreshold = recoverThresholds[stat];
	return recoverThreshold > 0 ? recoverThreshold : context.player.stat.get<IStatMax>(stat).max + recoverThreshold;
}
