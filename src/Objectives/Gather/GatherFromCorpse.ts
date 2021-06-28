import { ActionType } from "game/entity/action/IAction";
import Corpse from "game/entity/creature/corpse/Corpse";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { CreatureSearch } from "../../ITars";
import Objective from "../../Objective";
import { itemUtilities } from "../../utilities/Item";
import { objectUtilities } from "../../utilities/Object";
import { tileUtilities } from "../../utilities/Tile";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromCorpse extends Objective {

	constructor(private readonly search: CreatureSearch) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromCorpse:${this.search.identifier}`;
	}

	public getStatus(): string | undefined {
		return "Gathering items from corpses";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hasCarveItem = itemUtilities.hasInventoryItemForAction(context, ActionType.Carve);

		return objectUtilities.findCarvableCorpses(context, this.getIdentifier(), (corpse: Corpse) => {
			const itemTypes = this.search.map.get(corpse.type);
			if (itemTypes) {
				const resources = corpse.getResources(true);
				if (!resources || resources.length === 0) {
					return false;
				}

				const step = corpse.step || 0;

				const possibleItems = resources.slice(step);

				for (const itemType of itemTypes) {
					if (possibleItems.includes(itemType)) {
						return tileUtilities.canCarveCorpse(game.getTileFromPoint(corpse), true);
					}
				}
			}

			return false;
		})
			.map(corpse => {
				const objectives: IObjective[] = [];

				if (!hasCarveItem) {
					objectives.push(new AcquireItemForAction(ActionType.Carve));
				}

				objectives.push(new MoveToTarget(corpse, true));

				objectives.push(new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(corpse.type)!)
					.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, corpse.type).getString()} corpse`));

				return objectives;
			});
	}

	protected getBaseDifficulty(context: Context): number {
		return 20;
	}

}
