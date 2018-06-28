import { ICorpse } from "creature/corpse/ICorpse";
import { ActionType } from "Enums";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { MoveResult } from "../ITars";
import Objective from "../Objective";
import ExecuteAction from "./ExecuteAction";

export default class CarveCorpse extends Objective {

	constructor(private corpse: ICorpse) {
		super();
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const carveTool = Helpers.getInventoryItemsWithUse(ActionType.Carve);
		if (carveTool.length === 0) {
			return ObjectiveStatus.Complete;
		}

		const tile = game.getTileFromPoint(this.corpse);
		if (tile.events !== undefined) {
			return ObjectiveStatus.Complete;
		}

		const moveResult = await Helpers.moveToTarget(this.corpse);
		if (moveResult !== MoveResult.Complete) {
			return;
		}

		this.log.info("Facing matching corpse");

		if (!carveTool || !localPlayer.isFacingCarvableTile()) {
			this.log.info("Can't carve");
			return;
		}

		this.log.info("Carving corpse");

		return new ExecuteAction(ActionType.Carve, carveTool[0]);
	}

}
