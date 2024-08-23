/*!
 * Copyright 2011-2024 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import type Creature from "@wayward/game/game/entity/creature/Creature";
import { EquipType } from "@wayward/game/game/entity/IHuman";
import { ItemType } from "@wayward/game/game/item/IItem";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import type { CreatureSearch } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireInventoryItem from "../acquire/item/AcquireInventoryItem";
import AcquireItem from "../acquire/item/AcquireItem";
import AnalyzeInventory from "../analyze/AnalyzeInventory";
import AddDifficulty from "../core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import Lambda from "../core/Lambda";
import HuntCreature from "../other/creature/HuntCreature";
import EquipItem from "../other/item/EquipItem";

export default class GatherFromCreature extends Objective {

	constructor(private readonly search: CreatureSearch) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromCreature:${this.search.identifier}`;
	}

	public getStatus(): string | undefined {
		return "Gathering items from creatures";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return context.utilities.object.findCreatures(context, this.getIdentifier(), (creature: Creature) => this.search.map.has(creature.type) && !creature.isTamed && !context.utilities.creature.isScaredOfCreature(context.human, creature))
			.map(creature => {
				const objectives: IObjective[] = [];

				if (creature.aberrant) {
					objectives.push(new AddDifficulty(1000));
				}

				// require a sword and shield before engaging with a creature
				if (context.inventory.equipSword === undefined && !context.options.lockEquipment) {
					objectives.push(new AcquireItem(ItemType.WoodenShortSword), new AnalyzeInventory(), new EquipItem(EquipType.MainHand));
				}

				if (context.inventory.equipShield === undefined && !context.options.lockEquipment) {
					objectives.push(new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new EquipItem(EquipType.OffHand));
				}

				objectives.push(new AcquireInventoryItem("butcher"));

				objectives.push(new HuntCreature(creature, true));

				objectives.push(new Lambda(async context => {
					const corpses = context.human.facingTile.corpses;
					if (corpses && corpses.length > 0) {
						this.log.info("Carving corpse");
						return new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(creature.type)!)
							.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, creature.type).getString()} corpse`);
					}

					this.log.warn("Still attacking creature?");

					return ObjectiveResult.Restart;
				}).setStatus(this));

				return objectives;
			});
	}

	protected override getBaseDifficulty(context: Context): number {
		return 150;
	}

}
