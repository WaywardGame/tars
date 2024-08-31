import { ActionArgument, ActionType, IActionDescription } from "@wayward/game/game/entity/action/IAction";
import type Item from "@wayward/game/game/item/Item";
import Dictionary from "@wayward/game/language/Dictionary";
import { TextContext } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../../core/context/Context";
import { IInventoryItems } from "../../../core/ITars";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import ExecuteAction from "../../core/ExecuteAction";
import ReserveItems from "../../core/ReserveItems";

export type UseItemActionDescriptions =
	IActionDescription<[[ActionArgument.Undefined, ActionArgument.ItemInventory]]> |
	IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory]> |
	IActionDescription<[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]> |
	IActionDescription<[[ActionArgument.ItemNearby | ActionArgument.ItemInventory, any]]> |
	IActionDescription<[[ActionArgument.Undefined, ActionArgument.ItemNearby, ActionArgument.Doodad]]> |
	IActionDescription<[[ActionArgument.ItemNearby, ActionArgument.Doodad, ActionArgument.Undefined]]> |
	IActionDescription<[ActionArgument.ItemInventory, [ActionArgument.ItemInventory, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined], [ActionArgument.ItemNearby, ActionArgument.Undefined]]>;

export default class UseItem<T extends UseItemActionDescriptions> extends Objective {

	constructor(private readonly action: T, private readonly item?: Item | keyof IInventoryItems) {
		super();
	}

	public getIdentifier(): string {
		return `UseItem:${this.item}:${ActionType[this.action.type!]}`;
	}

	public getStatus(): string | undefined {
		return `Using ${typeof (this.item) === "string" ? this.item : this.item?.getName()} for ${Translation.nameOf(Dictionary.Action, this.action.type!).inContext(TextContext.Lowercase).getString()} action`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const actionType = this.action.type!;

		let item = typeof (this.item) === "string" ? context.inventory[this.item] : this.item ?? this.getAcquiredItem(context);
		if (Array.isArray(item)) {
			item = item[0];
		}

		if (!item?.isValid) {
			this.log.warn(`Invalid use item for action ${ActionType[actionType]}`);
			return ObjectiveResult.Restart;
		}

		const description = item.description;
		if (!description || !description.use || !description.use.includes(actionType)) {
			this.log.warn(`Invalid use item for action ${ActionType[actionType]}. Item ${item} is missing that action type`);
			return ObjectiveResult.Restart;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new ExecuteAction(this.action, [item] as any).setStatus(this), // TODO: why doesn't this typing work?
		];
	}

}
