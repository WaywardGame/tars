import Vector2 from "utilities/math/Vector2";

import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { baseUtilities } from "../../utilities/Base";
import MoveToTarget from "../core/MoveToTarget";

const returnToBaseDistance = 20;
const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);

export default class ReturnToBase extends Objective {

	public getIdentifier(): string {
		return "ReturnToBase";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const position = context.getPosition();
		const basePosition = baseUtilities.getBasePosition(context);
		if (position.z === basePosition.z && Vector2.squaredDistance(position, basePosition) <= returnToBaseDistanceSq) {
			return ObjectiveResult.Ignore;
		}

		this.log.info("Returning to base");

		return new MoveToTarget(basePosition, true);
	}

}
