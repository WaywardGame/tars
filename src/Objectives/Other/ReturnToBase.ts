import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { getBasePosition } from "../../Utilities/Base";
import MoveToTarget from "../Core/MoveToTarget";

export default class ReturnToBase extends Objective {

	public getIdentifier(): string {
		return "ReturnToBase";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const basePosition = getBasePosition(context);
		if (basePosition === context.player || Vector2.distance(context.player, basePosition) <= 20) {
			return ObjectiveResult.Ignore;
		}

		return new MoveToTarget(basePosition, true);
	}

}
