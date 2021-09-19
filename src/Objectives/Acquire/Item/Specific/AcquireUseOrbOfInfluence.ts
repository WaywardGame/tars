import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { Stat } from "game/entity/IStats";

import Context from "../../../../Context";
import { ContextDataType } from "../../../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../../IObjective";
import Objective from "../../../../Objective";
import AcquireItem from "../AcquireItem";
import SetContextData from "../../../contextData/SetContextData";
import ExecuteAction from "../../../core/ExecuteAction";
import Lambda from "../../../core/Lambda";
import { itemUtilities } from "../../../../utilities/Item";

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
		if (malign < 5000) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		const orbOfInfluenceItem = itemUtilities.getItemInInventory(context, ItemType.OrbOfInfluence);
		if (!orbOfInfluenceItem) {
			objectives.push(new AcquireItem(ItemType.OrbOfInfluence));

		} else {
			objectives.push(new SetContextData(ContextDataType.LastAcquiredItem, orbOfInfluenceItem));
		}

		objectives.push(new Lambda(async context => {
			const item = context.getData(ContextDataType.LastAcquiredItem);
			if (!item) {
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
