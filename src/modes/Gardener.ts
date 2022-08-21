import type { IContainer } from "game/item/IItem";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import BuildItem from "../objectives/other/item/BuildItem";
import type { ITarsMode } from "../core/mode/IMode";
import Restart from "../objectives/core/Restart";
import AcquireAndPlantSeed from "../objectives/acquire/item/specific/AcquireAndPlantSeed";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";

export class GardenerMode implements ITarsMode {

	// private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		// this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		if (!context.base.buildAnotherChest) {
			context.base.buildAnotherChest = true;

			if (context.base.chest.length > 0) {
				for (const c of context.base.chest) {
					if ((context.human.island.items.computeContainerWeight(c as IContainer) / context.human.island.items.getWeightCapacity(c)!) < 0.9) {
						context.base.buildAnotherChest = false;
						break;
					}
				}
			}
		}

		if (context.base.buildAnotherChest && context.inventory.chest === undefined) {
			// mark that we should build a chest (memory)
			// we need to do this to prevent a loop
			// if we take items out of a chest to build another chest,
			// the weight capacity could go back under the threshold. and then it wouldn't want to build another chest
			// this is reset to false in baseInfo.onAdd
			context.base.buildAnotherChest = true;

			objectives.push(new AcquireInventoryItem("shovel"));
			objectives.push(new AcquireInventoryItem("knife"));
			objectives.push(new AcquireInventoryItem("axe"));
			objectives.push([new AcquireInventoryItem("chest"), new BuildItem()]);
		}

		objectives.push([new AcquireAndPlantSeed(context.options.gardenerOnlyEdiblePlants), new Restart()]);

		// if (!multiplayer.isConnected()) {
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
