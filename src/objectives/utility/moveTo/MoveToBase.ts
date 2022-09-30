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
		const position = context.getPosition();
		const basePosition = context.utilities.base.getBasePosition(context);
		if (position.z === basePosition.z && Vector2.squaredDistance(position, basePosition) <= returnToBaseDistanceSq) {
			return ObjectiveResult.Ignore;
		}

		this.log.info("Returning to base");

		return new MoveToTarget(basePosition, true);
	}

}
