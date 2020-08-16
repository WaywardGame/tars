import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { getBasePosition } from "../../Utilities/Base";
import MoveToTarget from "../Core/MoveToTarget";

const returnToBaseDistance = 20;
const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);

export default class ReturnToBase extends Objective {

	public getIdentifier(): string {
		return "ReturnToBase";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const basePosition = getBasePosition(context);
		if (basePosition === context.player || Vector2.squaredDistance(context.player, basePosition) <= returnToBaseDistanceSq) {
			return ObjectiveResult.Ignore;
		}

		this.log.info("Returning to base");

		return new MoveToTarget(basePosition, true);
	}

}
