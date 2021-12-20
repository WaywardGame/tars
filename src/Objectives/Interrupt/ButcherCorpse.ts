import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { itemUtilities } from "../../utilities/Item";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";


export default class ButcherCorpse extends Objective {

	constructor(private readonly corpse: Corpse) {
		super();
	}

	public getIdentifier(): string {
		return `ButcherCorpse:${this.corpse.id}`;
	}

	public getStatus(): string | undefined {
		return `Butchering ${Translation.nameOf(Dictionary.Creature, this.corpse.type).getString()} corpse`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const tool = itemUtilities.getBestTool(context, ActionType.Butcher);
		if (tool === undefined) {
			this.log.info("Missing butcher tool for corpse");
			return ObjectiveResult.Impossible;
		}

		const tile = context.island.getTileFromPoint(this.corpse);

		if (tile.events !== undefined || tile.creature !== undefined) {
			return ObjectiveResult.Impossible;
		}

		const objectives: IObjective[] = [];

		objectives.push(new MoveToTarget(this.corpse, true));

		objectives.push(new ExecuteAction(ActionType.Butcher, (context, action) => {
			action.execute(context.player, tool);
			return ObjectiveResult.Complete;
		}).setStatus(this));

		return objectives;
	}

}
