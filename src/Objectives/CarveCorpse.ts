import { ActionType } from "action/IAction";
import { ICorpse } from "creature/corpse/ICorpse";
import { IObjective, ObjectiveStatus } from "../IObjective";
import Objective from "../Objective";
import { getInventoryItemsWithUse } from "../Utilities/Item";
import { MoveResult, moveToFaceTarget } from "../Utilities/Movement";
import ExecuteAction from "./ExecuteAction";

export default class CarveCorpse extends Objective {

	constructor(private readonly corpse: ICorpse) {
		super();
	}

	public getHashCode(): string {
		return `CarveCorpse:${corpseManager.getName(this.corpse, false).getString()}`;
	}

	public async onExecute(): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const carveTool = getInventoryItemsWithUse(ActionType.Carve);
		if (carveTool.length === 0) {
			this.log.info("Missing carve tool for corpse");
			return ObjectiveStatus.Complete;
		}

		const tile = game.getTileFromPoint(this.corpse);
		if (tile.events !== undefined) {
			this.log.info("Corpse tile has some events");
			return ObjectiveStatus.Complete;
		}

		const moveResult = await moveToFaceTarget(this.corpse);
		if (moveResult === MoveResult.NoPath) {
			this.log.info("No path to corpse");
			return ObjectiveStatus.Complete;
		}

		if (moveResult !== MoveResult.Complete) {
			return;
		}

		this.log.info("Facing matching corpse");

		if (!carveTool || !localPlayer.isFacingCarvableTile()) {
			this.log.info("Can't carve");
			return;
		}

		this.log.info("Carving corpse");

		return new ExecuteAction(ActionType.Carve, action => action.execute(localPlayer, carveTool[0]));
	}

}
