import { DoodadType } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { TurnMode } from "game/IGame";
import type { IContainer } from "game/item/IItem";
import { ItemType } from "game/item/IItem";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AcquireItemForAction from "../objectives/acquire/item/AcquireItemForAction";
import AcquireItemForDoodad from "../objectives/acquire/item/AcquireItemForDoodad";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import Lambda from "../objectives/core/Lambda";
import BuildItem from "../objectives/other/item/BuildItem";
import Idle from "../objectives/other/Idle";
import type { ITarsMode } from "../core/mode/IMode";
import AcquireSeed from "../objectives/acquire/item/specific/AcquireSeed";
import PlantSeeds from "../objectives/utility/PlantSeeds";
import Restart from "../objectives/core/Restart";

export class GardenerMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
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

			if (context.inventory.shovel === undefined) {
				objectives.push([new AcquireItemForAction(ActionType.Dig), new AnalyzeInventory()]);
			}

			if (context.inventory.knife === undefined) {
				objectives.push([new AcquireItem(ItemType.StoneKnife), new AnalyzeInventory()]);
			}

			if (context.inventory.axe === undefined) {
				objectives.push([new AcquireItem(ItemType.StoneAxe), new AnalyzeInventory()]);
			}

			objectives.push([new AcquireItemForDoodad(DoodadType.WoodenChest), new BuildItem(), new AnalyzeBase()]);
			// objectives.push([new AcquireItemByTypes(Array.from(chestTypes.keys())), new BuildItem(), new AnalyzeBase()]);
		}

		const seeds = context.utilities.item.getSeeds(context);
		if (seeds.length === 0) {
			objectives.push([new AcquireSeed(), new Restart()]);
		}

		objectives.push(new PlantSeeds());

		// objectives.push(new ReturnToBase());

		if (!multiplayer.isConnected()) {
			if (game.getTurnMode() !== TurnMode.RealTime) {
				objectives.push(new Lambda(async () => {
					this.finished(true);
					return ObjectiveResult.Complete;
				}));

			} else {
				objectives.push(new Idle());
			}
		}

		return objectives;
	}
}
