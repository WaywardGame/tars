import { IDoodad } from "doodad/IDoodad";
import { IVector3 } from "utilities/math/IVector";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { desertCutoff, IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";

export default class LeaveDesert extends Objective {

	private target: IVector3 | undefined;

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (localPlayer.y < desertCutoff) {
			return ObjectiveStatus.Complete;
		}

		this.target = Helpers.findDoodad("LeaveDesert", (doodad: IDoodad) => true);

		if (this.target === undefined) {
			this.log.info("Can't leave desert??");
			return ObjectiveStatus.Complete;
		}

		const moveResult = await Helpers.moveToTarget(this.target);

		if (moveResult === MoveResult.NoTarget) {
			this.log.info("No target to leave desert to");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.NoPath) {
			this.log.info("No path to leave desert");
			return ObjectiveStatus.Complete;
		}

		if (moveResult === MoveResult.Complete) {
			this.log.info("Successfully left the desert");
			return ObjectiveStatus.Complete;
		}
	}

}
