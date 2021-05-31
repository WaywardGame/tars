import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { getBestTool } from "../../utilities/Item";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";

export default class CarveCorpse extends Objective {

	constructor(private readonly corpse: Corpse) {
		super();
	}

	public getIdentifier(): string {
		return `CarveCorpse:${this.corpse.id}`;
	}

	public getStatus(): string {
		return `Carving ${Translation.nameOf(Dictionary.Creature, this.corpse.type).getString()} corpse`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const carveTool = getBestTool(context, ActionType.Carve);
		if (carveTool === undefined) {
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
			action.execute(context.player, carveTool);
		}).setStatus(this));

		return objectives;
	}

}
