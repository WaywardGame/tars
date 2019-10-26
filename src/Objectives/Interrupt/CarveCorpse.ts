import { ActionType } from "entity/action/IAction";
import { ICorpse } from "entity/creature/corpse/ICorpse";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { getInventoryItemsWithUse } from "../../Utilities/Item";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";

export default class CarveCorpse extends Objective {

	constructor(private readonly corpse: ICorpse) {
		super();
	}

	public getIdentifier(): string {
		return `CarveCorpse:${this.corpse.id}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const carveTool = getInventoryItemsWithUse(context, ActionType.Carve);
		if (carveTool.length === 0) {
			this.log.info("Missing carve tool for corpse");
			return ObjectiveResult.Impossible;
		}

		const tile = game.getTileFromPoint(this.corpse);

		if (tile.events !== undefined || tile.creature !== undefined) {
			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		objectives.push(new MoveToTarget(this.corpse, true));

		objectives.push(new ExecuteAction(ActionType.Carve, (context, action) => {
			action.execute(context.player, carveTool[0]);
		}));

		return objectives;
	}

}
