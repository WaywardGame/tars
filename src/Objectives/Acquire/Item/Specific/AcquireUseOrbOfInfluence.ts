import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { Stat } from "game/entity/IStats";

import type Context from "../../../../core/context/Context";
import { ContextDataType } from "../../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../../core/objective/IObjective";
import Objective from "../../../../core/objective/Objective";
import AcquireItem from "../AcquireItem";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteAction from "../../../core/ExecuteAction";
import Lambda from "../../../core/Lambda";

export default class AcquireUseOrbOfInfluence extends Objective {

	public readonly ignoreInvalidPlans = true;

	public getIdentifier(): string {
		return "AcquireUseOrbOfInfluence";
	}

	public getStatus(): string | undefined {
		return "Acquiring and using an orb of influence";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const malign = context.player.stat.get(Stat.Malignity)!;
		if (malign.value < 5000) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		const orbOfInfluenceItem = context.utilities.item.getItemInInventory(context, ItemType.OrbOfInfluence);
		if (orbOfInfluenceItem) {
			objectives.push(new SetContextData(ContextDataType.Item1, orbOfInfluenceItem));

		} else {
			objectives.push(new AcquireItem(ItemType.OrbOfInfluence).setContextDataKey(ContextDataType.Item1));
		}

		objectives.push(new Lambda(async context => {
			const item = context.getData(ContextDataType.Item1);
			if (!item) {
				this.log.error("Invalid orb of influence");
				return ObjectiveResult.Restart;
			}

			// reduce malignity
			return (new ExecuteAction(ActionType.RubCounterclockwise, (context, action) => {
				action.execute(context.player, item);
				return ObjectiveResult.Complete;
			}).setStatus(this));
		}));

		return objectives;
	}

}
