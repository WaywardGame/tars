/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import { TurnMode } from "@wayward/game/game/IGame";

import type Context from "../core/context/Context";
import type { IObjective } from "../core/objective/IObjective";
import { ObjectiveResult } from "../core/objective/IObjective";
import Lambda from "../objectives/core/Lambda";
import Idle from "../objectives/other/Idle";
import MoveToBase from "../objectives/utility/moveTo/MoveToBase";
import OrganizeInventory from "../objectives/utility/OrganizeInventory";
import CompleteQuests from "../objectives/quest/CompleteQuests";
import type { ITarsMode } from "../core/mode/IMode";
import { BaseMode } from "./BaseMode";

export class QuestMode extends BaseMode implements ITarsMode {

	private finished: (success: boolean) => void;

	public async initialize(_: Context, finished: (success: boolean) => void): Promise<void> {
		this.finished = finished;
	}

	public async determineObjectives(context: Context): Promise<Array<IObjective | IObjective[]>> {
		const objectives: Array<IObjective | IObjective[]> = [];

		objectives.push(...await this.getCommonInitialObjectives(context));

		objectives.push(new CompleteQuests());

		objectives.push(new MoveToBase());

		objectives.push(new OrganizeInventory());

		if (!multiplayer.isConnected) {
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
