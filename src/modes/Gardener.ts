import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import type { ITarsMode } from "../core/mode/IMode";
import Restart from "../objectives/core/Restart";
import AcquireAndPlantSeed from "../objectives/acquire/item/specific/AcquireAndPlantSeed";
import { BaseMode } from "./BaseMode";

export class GardenerMode extends BaseMode implements ITarsMode {

	// private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		// this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		objectives.push([new AcquireAndPlantSeed(context.options.gardenerOnlyEdiblePlants), new Restart()]);

		// if (!multiplayer.isConnected) {
		// 	if (game.getTurnMode() !== TurnMode.RealTime) {
		// 		objectives.push(new Lambda(async () => {
		// 			this.finished(true);
		// 			return ObjectiveResult.Complete;
		// 		}));

		// 	} else {
		// 		objectives.push(new Idle());
		// 	}
		// }

		return objectives;
	}
}
