import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { RequirementStatus } from "game/item/IItemManager";
import type Item from "game/item/Item";

import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AcquireItem from "../acquire/item/AcquireItem";
import SetContextData from "../contextData/SetContextData";
import ExecuteAction from "../core/ExecuteAction";
import CompleteRequirements from "../utility/CompleteRequirements";

export default class RepairItem extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `RepairItem:${this.item}`;
	}

	public getStatus(): string | undefined {
		return `Repairing ${this.item.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.item === context.inventory.hammer) {
			return ObjectiveResult.Ignore;
		}

		if (this.item.minDur === undefined || this.item.maxDur === undefined) {
			this.log.warn(`Can't repair item ${this.item}, invalid durability`);
			return ObjectiveResult.Ignore;
		}

		const description = this.item.description();
		if (!description || description.durability === undefined || description.repairable === false) {
			// this.log.warn("item isn't repariable", this.item, description);
			return ObjectiveResult.Ignore;
		}

		if (context.player.isSwimming()) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		if (context.inventory.hammer) {
			objectives.push(new SetContextData(ContextDataType.Item1, context.inventory.hammer));

		} else {
			objectives.push(new AcquireItem(ItemType.StoneHammer).setContextDataKey(ContextDataType.Item1));
		}

		const requirementInfo = context.island.items.hasAdditionalRequirements(context.player, this.item.type, undefined, undefined, true);
		if (requirementInfo.requirements === RequirementStatus.Missing) {
			this.log.info("Repair requirements not met");
			objectives.push(new CompleteRequirements(requirementInfo));
		}

		objectives.push(new ExecuteAction(ActionType.Repair, (context, action) => {
			const hammer = context.getData(ContextDataType.Item1);
			if (!hammer) {
				this.log.error("Invalid hammer");
				return ObjectiveResult.Restart;
			}

			action.execute(context.player, hammer, this.item);
			return ObjectiveResult.Complete;
		}).setStatus(this));

		return objectives;
	}

}
