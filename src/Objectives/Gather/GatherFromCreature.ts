import { ActionType } from "game/entity/action/IAction";
import Creature from "game/entity/creature/Creature";
import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import { CreatureSearch } from "../../ITars";
import Objective from "../../Objective";
import { getInventoryItemsWithUse } from "../../Utilities/Item";
import { findCreatures } from "../../Utilities/Object";
import AcquireItem from "../Acquire/Item/AcquireItem";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import AnalyzeInventory from "../Analyze/AnalyzeInventory";
import AddDifficulty from "../Core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../Core/ExecuteActionForItem";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import Equip from "../Other/Equip";

export default class GatherFromCreature extends Objective {

	constructor(private readonly search: CreatureSearch) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromCreature:${this.search.identifier}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const hasCarveItem = getInventoryItemsWithUse(context, ActionType.Carve).length > 0;

		return findCreatures(context, this.getIdentifier(), (creature: Creature) => this.search.map.has(creature.type) && !creature.isTamed())
			.map(creature => {
				const objectives: IObjective[] = [];

				if (creature.aberrant) {
					objectives.push(new AddDifficulty(1000));
				}

				// require a sword and shield before engaging with a creature
				if (context.inventory.equipSword === undefined) {
					objectives.push(new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new Equip(EquipType.LeftHand));
				}

				if (context.inventory.equipShield === undefined) {
					objectives.push(new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new Equip(EquipType.RightHand));
				}

				if (!hasCarveItem) {
					objectives.push(new AcquireItemForAction(ActionType.Carve));
				}

				objectives.push((new MoveToTarget(creature, false)).trackCreature(creature));

				objectives.push(new Lambda(async context => {
					const corpses = context.player.getFacingTile().corpses;
					if (corpses && corpses.length > 0) {
						this.log.info("Carving corpse");
						return new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(creature.type)!)
							.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, creature.type).getString()} corpse`);
					}

					return ObjectiveResult.Complete;
				}));

				return objectives;
			});
	}

	protected getBaseDifficulty(context: Context): number {
		return 150;
	}

}
