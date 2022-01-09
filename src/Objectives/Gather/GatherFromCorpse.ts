import { ActionType } from "game/entity/action/IAction";
import type Corpse from "game/entity/creature/corpse/Corpse";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { CreatureSearch } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromCorpse extends Objective {

	public readonly gatherObjectivePriority = 600;

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
		const hasTool = context.utilities.item.hasInventoryItemForAction(context, ActionType.Butcher);

		return context.utilities.object.findCarvableCorpses(context, this.getIdentifier(), (corpse: Corpse) => {
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
						return context.utilities.tile.canButcherCorpse(context, context.island.getTileFromPoint(corpse), true);
					}
				}
			}

			return false;
		})
			.map(corpse => {
				const objectives: IObjective[] = [];

				if (!hasTool) {
					objectives.push(new AcquireItemForAction(ActionType.Butcher));
				}

				objectives.push(new MoveToTarget(corpse, true));

				objectives.push(new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(corpse.type)!)
					.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, corpse.type).getString()} corpse`));

				return objectives;
			});
	}

	protected override getBaseDifficulty(context: Context): number {
		return 20;
	}

}
