import { ActionType } from "entity/action/IAction";
import { ICorpse } from "entity/creature/corpse/ICorpse";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { CreatureSearch } from "../../ITars";
import Objective from "../../Objective";
import { getInventoryItemsWithUse } from "../../Utilities/Item";
import { findCarvableCorpses } from "../../Utilities/Object";
import { canCarveCorpse } from "../../Utilities/Tile";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import ExecuteActionForItem, { ExecuteActionType } from "../Core/ExecuteActionForItem";
import MoveToTarget from "../Core/MoveToTarget";

export default class GatherFromCorpse extends Objective {

	constructor(private readonly search: CreatureSearch) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromCorpse:${this.search.identifier}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hasCarveItem = getInventoryItemsWithUse(context, ActionType.Carve).length > 0;

		return findCarvableCorpses(context, this.getIdentifier(), (corpse: ICorpse) => {
			const itemTypes = this.search.map.get(corpse.type);
			if (itemTypes) {
				const resources = corpseManager.getResources(corpse, true);
				if (!resources || resources.length === 0) {
					return false;
				}

				const step = corpse.step || 0;

				const possibleItems = resources.slice(step);

				for (const itemType of itemTypes) {
					if (possibleItems.includes(itemType)) {
						return canCarveCorpse(game.getTileFromPoint(corpse), true);
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

				objectives.push(new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(corpse.type)!));

				return objectives;
			});
	}

	protected getBaseDifficulty(context: Context): number {
		return 20;
	}

}
