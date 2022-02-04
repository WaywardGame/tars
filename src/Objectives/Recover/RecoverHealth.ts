import { ActionType } from "game/entity/action/IAction";
import type { IStat } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import { WeightStatus } from "game/entity/player/IPlayer";
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
			return new UseItem(ActionType.Heal, healItems[0]);
		}

		if (this.onlyUseAvailableItems) {
			return ObjectiveResult.Ignore;
		}

		const isThirsty = context.human.stat.get<IStat>(Stat.Thirst).value <= 0;
		const isHungry = !context.human.status.Bleeding && context.human.stat.get<IStat>(Stat.Hunger).value <= 0;
		const hasWeightProblems = context.human.getWeightStatus() !== WeightStatus.None;

		this.saveChildObjectives = !hasWeightProblems;

		const objectives: IObjective[] = [];

		if (hasWeightProblems) {
			// special case - reduce weight now
			this.log.info("Reduce weight before finding a health item");
			objectives.push(new OrganizeInventory({ allowChests: false }));

		} else if (!isThirsty && !isHungry) {
			this.log.info("Acquire a Health item");

			objectives.push(new AcquireItemForAction(ActionType.Heal).keepInInventory());
			objectives.push(new UseItem(ActionType.Heal));
		}

		return objectives;
	}

}
