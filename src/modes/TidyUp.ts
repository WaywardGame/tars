import { ActionType } from "game/entity/action/IAction";
import { DamageType } from "game/entity/IEntity";
import type { IContainer } from "game/item/IItem";

import type Context from "../core/context/Context";
import { IObjective, ObjectiveResult } from "../core/objective/IObjective";
import AcquireItemForAction from "../objectives/acquire/item/AcquireItemForAction";
import BuildItem from "../objectives/other/item/BuildItem";
import ReturnToBase from "../objectives/other/ReturnToBase";
import OrganizeBase from "../objectives/utility/OrganizeBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import type { ITarsMode } from "../core/mode/IMode";
import Lambda from "../objectives/core/Lambda";
import AcquireInventoryItem from "../objectives/acquire/item/AcquireInventoryItem";

/**
 * Marie Kondo mode
 */
export class TidyUpMode implements ITarsMode {

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

			const chopItem = context.utilities.item.getBestTool(context, ActionType.Chop, DamageType.Slashing);
			if (chopItem === undefined) {
				objectives.push([new AcquireItemForAction(ActionType.Chop)]);
			}

			objectives.push(new AcquireInventoryItem("shovel"));
			objectives.push(new AcquireInventoryItem("knife"));
			objectives.push(new AcquireInventoryItem("axe"));
			objectives.push([new AcquireInventoryItem("chest"), new BuildItem()]);
		}

		const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
		if (tiles.totalCount > 0) {
			objectives.push(new OrganizeBase(tiles.tiles));
		}

		objectives.push(new ReturnToBase());

		objectives.push(new OrganizeInventory());

		objectives.push(new Lambda(async () => ObjectiveResult.Complete).setStatus("Waiting"));
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
