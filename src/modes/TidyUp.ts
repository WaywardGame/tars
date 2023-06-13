/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Context from "../core/context/Context";
import { IObjective, ObjectiveResult } from "../core/objective/IObjective";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import OrganizeBase from "../objectives/utility/OrganizeBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import type { ITarsMode } from "../core/mode/IMode";
import Lambda from "../objectives/core/Lambda";
import { BaseMode } from "./BaseMode";

/**
 * Marie Kondo mode
 */
export class TidyUpMode extends BaseMode implements ITarsMode {

	// private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void) {
		// this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getBuildAnotherChestObjectives(context));

		const tiles = context.utilities.base.getTilesWithItemsNearBase(context);
		if (tiles.totalCount > 0) {
			objectives.push(new OrganizeBase(tiles.tiles));
		}

		objectives.push(new MoveToBase());

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
