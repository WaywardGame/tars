import { ActionType } from "game/entity/action/IAction";
import type Item from "game/item/Item";
import Dictionary from "language/Dictionary";
import { TextContext } from "language/ITranslation";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import ReserveItems from "../../core/ReserveItems";

export default class UseItem extends Objective {

	constructor(private readonly actionType: ActionType, private readonly item?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `UseItem:${this.item}:${ActionType[this.actionType]}`;
	}

	public getStatus(): string | undefined {
		return `Using ${this.item?.getName()} for ${Translation.nameOf(Dictionary.Action, this.actionType).inContext(TextContext.Lowercase).getString()} action`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const item = this.item ?? this.getAcquiredItem(context);
		if (!item?.isValid()) {
			this.log.warn(`Invalid use item for action ${ActionType[this.actionType]}`);
			return ObjectiveResult.Restart;
		}

		const description = item.description();
		if (!description || !description.use || !description.use.includes(this.actionType)) {
			this.log.warn(`Invalid use item for action ${ActionType[this.actionType]}. Item ${item} is missing that action type`);
			return ObjectiveResult.Restart;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(ActionType.UseItem, (context, action) => {
				if (!item.isValid()) {
					// item may have already been built?
					// this.log.warn(`Invalid use item for action ${ActionType[this.actionType]}. Item ${item} is not valid`, this.getStatus());
					return ObjectiveResult.Restart;
				}

				if (!item.isNearby(context.human, true)) {
					this.log.warn(`Invalid use item for action ${ActionType[this.actionType]}. Item ${item} is not nearby`, this.getStatus());
					return ObjectiveResult.Restart;
				}

				action.execute(context.actionExecutor, item, this.actionType);

				return ObjectiveResult.Complete;
			}).setStatus(this),
		];
	}

}
