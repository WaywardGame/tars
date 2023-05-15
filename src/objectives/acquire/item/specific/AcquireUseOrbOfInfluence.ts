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
import ReserveItems from "../../../core/ReserveItems";
import { ActionArguments } from "game/entity/action/IAction";

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

		objectives.push(new ExecuteAction(RubCounterClockwise, (context) => {
			const item = context.getData(itemContextDataKey);
			if (!item?.isValid()) {
				this.log.error("Invalid orb of influence");
				return ObjectiveResult.Restart;
			}

			return [item] as ActionArguments<typeof RubCounterClockwise>;
		}).setStatus(this));

		return objectives;
	}

}
