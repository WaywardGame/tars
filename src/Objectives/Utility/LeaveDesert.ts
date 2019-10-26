import Context from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { desertCutoff } from "../../ITars";
import Objective from "../../Objective";
import { findDoodad } from "../../Utilities/Object";
import MoveToTarget from "../Core/MoveToTarget";

export default class LeaveDesert extends Objective {

	public getIdentifier(): string {
		return "LeaveDesert";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.player.y < desertCutoff) {
			return ObjectiveResult.Complete;
		}

		const target = findDoodad(context, "LeaveDesert", () => true);

		if (target === undefined) {
			this.log.info("Can't leave desert?");
			return ObjectiveResult.Complete;
		}

		return new MoveToTarget(target, true);
	}

}
