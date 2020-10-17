import { ActionType } from "entity/action/IAction";
import { IStat, Stat } from "entity/IStats";
import { WeightStatus } from "entity/player/IPlayer";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { getInventoryItemsWithUse } from "../../Utilities/Item";
import AcquireItemForAction from "../Acquire/Item/AcquireItemForAction";
import UseItem from "../Other/UseItem";
import OrganizeInventory from "../Utility/OrganizeInventory";

export default class RecoverHealth extends Objective {

	private saveChildObjectives = false;

	public getIdentifier(): string {
		return "RecoverHealth";
	}

	public getStatus(): string {
		return "Recovering health";
	}

	public canSaveChildObjectives(): boolean {
		return this.saveChildObjectives;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const healItems = getInventoryItemsWithUse(context, ActionType.Heal);
		if (healItems.length > 0) {
			this.log.info(`Healing with ${healItems[0].getName().getString()}`);
			return new UseItem(ActionType.Heal, healItems[0]);
		}

		const isThirsty = context.player.stat.get<IStat>(Stat.Thirst).value <= 0;
		const isHungry = !context.player.status.Bleeding && context.player.stat.get<IStat>(Stat.Hunger).value <= 0;
		const hasWeightProblems = context.player.getWeightStatus() !== WeightStatus.None;

		this.saveChildObjectives = !hasWeightProblems;

		const objectives: IObjective[] = [];

		if (hasWeightProblems) {
			// special case - reduce weight now
			this.log.info("Reduce weight before finding a health item");
			objectives.push(new OrganizeInventory({ allowChests: false }));

		} else if (!isThirsty && !isHungry) {
			this.log.info("Acquire a Health item");

			objectives.push(new AcquireItemForAction(ActionType.Heal));
			objectives.push(new UseItem(ActionType.Heal));
		}

		return objectives;
	}

}
