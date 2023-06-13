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

import Vector2 from "utilities/math/Vector2";

import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";

const returnToBaseDistance = 20;
const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);

export default class MoveToBase extends Objective {

	public getIdentifier(): string {
		return "MoveToBase";
	}

	public getStatus(): string | undefined {
		return "Moving to the base";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const tile = context.getTile();
		const baseTile = context.utilities.base.getBaseTile(context);
		if (tile.z === baseTile.z && Vector2.squaredDistance(tile, baseTile) <= returnToBaseDistanceSq) {
			return ObjectiveResult.Ignore;
		}

		this.log.info("Returning to base");

		return new MoveToTarget(baseTile, true);
	}

}
