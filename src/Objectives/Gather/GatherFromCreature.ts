import { ActionType } from "game/entity/action/IAction";
import type Creature from "game/entity/creature/Creature";
import { EquipType } from "game/entity/IHuman";
import { ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import HuntCreature from "../other/creature/HuntCreature";
import type Context from "../../core/context/Context";
import type { CreatureSearch } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItem from "../acquire/item/AcquireItem";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import AnalyzeInventory from "../analyze/AnalyzeInventory";
import AddDifficulty from "../core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import Lambda from "../core/Lambda";
import EquipItem from "../other/item/EquipItem";

export default class GatherFromCreature extends Objective {

	public readonly gatherObjectivePriority = 700;

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
		const hasTool = context.utilities.item.hasInventoryItemForAction(context, ActionType.Butcher);

		return context.utilities.object.findCreatures(context, this.getIdentifier(), (creature: Creature) => this.search.map.has(creature.type) && !creature.isTamed())
			.map(creature => {
				const objectives: IObjective[] = [];

				if (creature.aberrant) {
					objectives.push(new AddDifficulty(1000));
				}

				// require a sword and shield before engaging with a creature
				if (context.inventory.equipSword === undefined) {
					objectives.push(new AcquireItem(ItemType.WoodenSword), new AnalyzeInventory(), new EquipItem(EquipType.LeftHand));
				}

				if (context.inventory.equipShield === undefined) {
					objectives.push(new AcquireItem(ItemType.WoodenShield), new AnalyzeInventory(), new EquipItem(EquipType.RightHand));
				}

				if (!hasTool) {
					objectives.push(new AcquireItemForAction(ActionType.Butcher));
				}

				objectives.push(new HuntCreature(creature, true));

				objectives.push(new Lambda(async context => {
					const corpses = context.human.getFacingTile().corpses;
					if (corpses && corpses.length > 0) {
						this.log.info("Carving corpse");
						return new ExecuteActionForItem(ExecuteActionType.Corpse, this.search.map.get(creature.type)!)
							.setStatus(() => `Carving ${Translation.nameOf(Dictionary.Creature, creature.type).getString()} corpse`);
					}

					this.log.warn("Still attacking creature?");

					return ObjectiveResult.Restart;
				}));

				return objectives;
			});
	}

	protected override getBaseDifficulty(context: Context): number {
		return 150;
	}

}
