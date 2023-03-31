import { ActionType } from "game/entity/action/IAction";
import type { IStat, IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";
import Heal from "game/entity/action/actions/Heal";
import Cure from "game/entity/action/actions/Cure";
import Eat from "game/entity/action/actions/Eat";

import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItemForAction from "../acquire/item/AcquireItemForAction";
import UseItem from "../other/item/UseItem";
import OrganizeInventory from "../utility/OrganizeInventory";

export default class RecoverHealth extends Objective {

	private saveChildObjectives = false;

	constructor(private readonly onlyUseAvailableItems: boolean) {
		super();
	}

	public getIdentifier(): string {
		return `RecoverHealth:${this.onlyUseAvailableItems}`;
	}

	public getStatus(): string | undefined {
		return "Recovering health";
	}

	public override canSaveChildObjectives(): boolean {
		return this.saveChildObjectives;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const healItems = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Heal);
		if (healItems.length > 0) {
			this.log.info(`Healing with ${healItems[0].getName().getString()}`);
			return new UseItem(Heal, healItems[0]);
		}

		const health = context.human.stat.get<IStatMax>(Stat.Health);
		if (health.value <= 10) {
			// emergency. eating can recover health
			// const eatItems = context.utilities.item.getInventoryItemsWithUse(context, ActionType.Eat);
			// const bestEatItem = eatItems.filter(item => context.utilities.item.isEdible(item.type));
			const healthRecoveryFoodItems = Array.from(context.utilities.item.foodItemTypes)
				.map(foodItemType => context.utilities.item.getItemsInContainerByType(context, context.human.inventory, foodItemType))
				.flat()
				.sort((a, b) => (b.description?.onUse?.[ActionType.Eat]?.[0] ?? -99) - (a.description?.onUse?.[ActionType.Eat]?.[0] ?? -99));
			if (healthRecoveryFoodItems.length > 0) {
				return new UseItem(Eat, healthRecoveryFoodItems[0]);
			}
		}

		if (this.onlyUseAvailableItems) {
			return ObjectiveResult.Ignore;
		}

		const isThirsty = context.human.stat.get<IStat>(Stat.Thirst).value <= 0;
		const isHungry = !context.human.status.Bleeding && context.human.stat.get<IStat>(Stat.Hunger).value <= 0;
		const hasWeightProblems = context.human.getWeightStatus() !== WeightStatus.None;

		this.saveChildObjectives = !hasWeightProblems;

		const objectives: IObjective[] = [];

		if (context.human.status.Bleeding && context.inventory.bandage) {
			objectives.push(new UseItem(Heal, "bandage"));
		}

		if (context.human.status.Poisoned && context.inventory.curePoison) {
			objectives.push(new UseItem(Cure, "curePoison"));
		}

		if (hasWeightProblems) {
			// special case - reduce weight now
			this.log.info("Reduce weight before finding a health item");
			objectives.push(new OrganizeInventory({ allowChests: false }));

		} else if (!isThirsty && !isHungry) {
			this.log.info("Acquire a Health item");

			objectives.push(new AcquireItemForAction(ActionType.Heal).keepInInventory());
			objectives.push(new UseItem(Heal));
		}

		return objectives;
	}

}
