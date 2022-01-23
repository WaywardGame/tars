import { DoodadType } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import { DamageType } from "game/entity/IEntity";
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
import ReturnToBase from "../objectives/other/ReturnToBase";
import OrganizeBase from "../objectives/utility/OrganizeBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import type { ITarsMode } from "../core/mode/IMode";

/**
 * Marie Kondo mode
 */
export class TidyUpMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		let acquireChest = true;

		if (context.base.buildAnotherChest) {
			// build another chest if we're near the base
			acquireChest = context.utilities.base.isNearBase(context);

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

			const chopItem = context.utilities.item.getBestTool(context, ActionType.Chop, DamageType.Slashing);
			if (chopItem === undefined) {
				objectives.push([new AcquireItemForAction(ActionType.Chop)]);
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

		const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
		if (tiles.totalCount > 0) {
			objectives.push(new OrganizeBase(tiles.tiles));
		}

		objectives.push(new ReturnToBase());

		objectives.push(new OrganizeInventory());

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