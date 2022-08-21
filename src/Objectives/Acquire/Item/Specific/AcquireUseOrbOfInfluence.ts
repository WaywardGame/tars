import { ItemType } from "game/item/IItem";
import { Stat } from "game/entity/IStats";
import RubCounterClockwise from "game/entity/action/actions/RubCounterClockwise";

import type Context from "../../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import AcquireItem from "../AcquireItem";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteAction from "../../../core/ExecuteAction";
import Lambda from "../../../core/Lambda";
import ReserveItems from "../../../core/ReserveItems";

export default class AcquireUseOrbOfInfluence extends Objective {

	public readonly ignoreInvalidPlans = true;

	public getIdentifier(): string {
		return "AcquireUseOrbOfInfluence";
	}

	public getStatus(): string | undefined {
		return "Acquiring and using an orb of influence";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const malign = context.human.stat.get(Stat.Malignity)!;
		if (malign.value < 5000) {
			return ObjectiveResult.Ignore;
		}

		const itemContextDataKey = this.getUniqueContextDataKey("OrbOfInfluence");

		const objectives: IObjective[] = [];

		const orbOfInfluenceItem = context.utilities.item.getItemInInventory(context, ItemType.OrbOfInfluence);
		if (orbOfInfluenceItem) {
			objectives.push(new ReserveItems(orbOfInfluenceItem));
			objectives.push(new SetContextData(itemContextDataKey, orbOfInfluenceItem));

		} else {
			objectives.push(new AcquireItem(ItemType.OrbOfInfluence).passAcquireData(this).setContextDataKey(itemContextDataKey));
		}

		objectives.push(new Lambda(async context => {
			const item = context.getData(itemContextDataKey);
			if (!item?.isValid()) {
				this.log.error("Invalid orb of influence");
				return ObjectiveResult.Restart;
			}

			// reduce malignity
			return (new ExecuteAction(RubCounterClockwise, [item]).setStatus(this));
		}).setStatus(this));

		return objectives;
	}

}
