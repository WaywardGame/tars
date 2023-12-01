/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Corpse from "@wayward/game/game/entity/creature/corpse/Corpse";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import type { CreatureSearch } from "../../core/ITars";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
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
		return context.utilities.object.findCarvableCorpses(context, this.getIdentifier(), (corpse: Corpse) => {
			const itemTypes = this.search.map.get(corpse.type);
			if (itemTypes) {
				const resources = corpse.getResources(true);
				if (!resources || resources.length === 0) {
					return false;
				}

				const step = corpse.step || 0;

				const possibleItems = resources.slice(step);

				return itemTypes.some(itemType => possibleItems.includes(itemType));
			}

			return false;
		})
			.map(corpse => {
				return [
					new AcquireInventoryItem("butcher"),
					new MoveToTarget(corpse, true),
					new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(corpse.type)!)
						.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, corpse.type).getString()} corpse`),
				];
			});
	}

	protected override getBaseDifficulty(context: Context): number {
		return 20;
	}

}
