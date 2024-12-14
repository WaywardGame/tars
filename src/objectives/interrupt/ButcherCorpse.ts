import type Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import Butcher from "@wayward/game/game/entity/action/actions/Butcher";
// import Message from "@wayward/game/language/dictionary/Message";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import ExecuteAction from "../core/ExecuteAction";
import MoveToTarget from "../core/MoveToTarget";
import Message from "@wayward/game/language/dictionary/Message";

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
		if (!this.corpse.isValid) {
			return ObjectiveResult.Impossible;
		}

		const tool = context.inventory.butcher;
		if (tool === undefined) {
			this.log.info("Missing butcher tool for corpse");
			return ObjectiveResult.Impossible;
		}

		const tile = this.corpse.tile;
		if (tile.events !== undefined || tile.creature !== undefined) {
			return ObjectiveResult.Impossible;
		}

		// CannotAnythingHere is expected because we the amount of times a corpse can be carved is random
		// TARS tries to carve the maximum amount of times
		return [
			new MoveToTarget(this.corpse, true),
			new ExecuteAction(Butcher, [tool], new Set([Message.CannotAnythingHere]), ObjectiveResult.Complete).setStatus(this),
		];
	}

}
