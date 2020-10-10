import { IStatMax, Stat } from "entity/IStats";

import Context from "../Context";

export function isHealthy(context: Context) {
	return context.player.stat.get<IStatMax>(Stat.Health).value > 8
		&& context.player.stat.get<IStatMax>(Stat.Hunger).value > 8;
}

export function isUsingVehicle(context: Context) {
	return context.player.vehicleItemId !== undefined;
}
