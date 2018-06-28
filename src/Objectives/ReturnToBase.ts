import Vector2 from "utilities/math/Vector2";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";

export default class ReturnToBase extends Objective {

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const basePosition = Helpers.getBasePosition(base);
		if (basePosition === localPlayer || Vector2.squaredDistance(localPlayer, basePosition) <= 20) {
			return ObjectiveStatus.Complete;
		}

		const moveResult = await Helpers.moveToTarget(basePosition);
		if (moveResult === MoveResult.NoPath) {
			this.log.info("Unable to find a path back to the base");
			return ObjectiveStatus.Complete;

		}

		if (moveResult === MoveResult.Complete) {
			return ObjectiveStatus.Complete;
		}
	}

}
