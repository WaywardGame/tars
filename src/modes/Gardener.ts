import { DoodadType } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { DamageType } from "game/entity/IEntity";
import { TurnMode } from "game/IGame";
import { IContainer, ItemType } from "game/item/IItem";

import Context from "../core/context/Context";
import { IObjective, ObjectiveResult } from "../core/objective/IObjective";
import AcquireItem from "../objectives/acquire/item/AcquireItem";
import AcquireItemForAction from "../objectives/acquire/item/AcquireItemForAction";
import AcquireItemForDoodad from "../objectives/acquire/item/AcquireItemForDoodad";
import AnalyzeBase from "../objectives/analyze/AnalyzeBase";
import AnalyzeInventory from "../objectives/analyze/AnalyzeInventory";
import Lambda from "../objectives/core/Lambda";
import BuildItem from "../objectives/other/item/BuildItem";
import Idle from "../objectives/other/Idle";
import { ITarsMode } from "../core/mode/IMode";
import { baseUtilities } from "../utilities/Base";
import { itemUtilities } from "../utilities/Item";
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

		let acquireChest = true;

		if (context.base.buildAnotherChest) {
			// build another chest if we're near the base
			acquireChest = baseUtilities.isNearBase(context);

		} else if (context.base.chest.length > 0) {
			for (const c of context.base.chest) {
				if ((context.player.island.items.computeContainerWeight(c as IContainer) / context.player.island.items.getWeightCapacity(c)!) < 0.9) {
					acquireChest = false;
					break;
				}
			}
		}

		if (acquireChest && context.inventory.chest === undefined) {
			// mark that we should build a chest (memory)
			// we need to do this to prevent a loop
			// if we take items out of a chest to build another chest,
			// the weight capacity could go back under the threshold. and then it wouldn't want to build another chest
			// this is reset to false in baseInfo.onAdd
			context.base.buildAnotherChest = true;

			const gatherItem = itemUtilities.getBestTool(context, ActionType.Gather, DamageType.Slashing);
			if (gatherItem === undefined) {
				objectives.push([new AcquireItemForAction(ActionType.Gather)]);
			}

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
		}

		const seeds = itemUtilities.getSeeds(context);
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
