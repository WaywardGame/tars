import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";
import Item from "item/Item";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { isSwimming } from "../../Utilities/Tile";
import AcquireItem from "../Acquire/Item/AcquireItem";
import CopyContextData from "../ContextData/CopyContextData";
import SetContextData from "../ContextData/SetContextData";
import ExecuteAction from "../Core/ExecuteAction";
import CompleteRequirements from "../Utility/CompleteRequirements";

export default class RepairItem extends Objective {

	constructor(private readonly item: Item) {
		super();
	}

	public getIdentifier(): string {
		return `RepairItem:${this.item}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (this.item.minDur === undefined || this.item.maxDur === undefined || this.item === context.inventory.hammer) {
			this.log.warn("can't repair item no dur", this.item);
			return ObjectiveResult.Ignore;
		}

		const description = this.item.description();
		if (!description || description.durability === undefined || description.repairable === false) {
			// this.log.warn("item isn't repariable", this.item, description);
			return ObjectiveResult.Ignore;
		}

		if (isSwimming(context)) {
			return ObjectiveResult.Ignore;
		}

		const objectives: IObjective[] = [];

		if (context.inventory.hammer === undefined) {
			objectives.push(new AcquireItem(ItemType.StoneHammer));

			// LastAcquiredItem could change between now and when we need it. copy it in Item1
			objectives.push(new CopyContextData(ContextDataType.Item1, ContextDataType.LastAcquiredItem));

		} else {
			objectives.push(new SetContextData(ContextDataType.Item1, context.inventory.hammer));
		}

		const requirements = itemManager.hasAdditionalRequirements(context.player, this.item.type);
		if (!requirements.requirementsMet) {
			objectives.push(new CompleteRequirements(description.recipe?.requiredDoodad, (description.recipe?.requiresFire || description.repairAndDisassemblyRequiresFire) ? true : false));
		}

		objectives.push(new ExecuteAction(ActionType.Repair, (context, action) => {
			const hammer = context.getData(ContextDataType.Item1);
			if (!hammer) {
				this.log.error("Invalid hammer");
				return;
			}

			action.execute(context.player, hammer, this.item);
		}));

		return objectives;
	}

}
