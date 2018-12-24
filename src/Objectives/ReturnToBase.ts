import Vector2 from "utilities/math/Vector2";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getBasePosition } from "../Utilities/Base";
import { moveToFaceTarget, MoveResult } from "../Utilities/Movement";

export default class ReturnToBase extends Objective {
	
	public getHashCode(): string {
		return "ReturnToBase";
	}
	
	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const basePosition = getBasePosition(base);
		if (basePosition === localPlayer || Vector2.distance(localPlayer, basePosition) <= 20) {
			return ObjectiveStatus.Complete;
		}
		
		const moveResult = await moveToFaceTarget(basePosition);
		if (moveResult === MoveResult.NoPath) {
			this.log.info("Unable to find a path back to the base");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.Complete) {
			return ObjectiveStatus.Complete;
		}
	}

}
