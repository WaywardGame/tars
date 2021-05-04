import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { itemDescriptions as Items } from "game/item/Items";
import { Dictionary } from "language/Dictionaries";
import Translation, { TextContext } from "language/Translation";
import Enums from "utilities/enum/Enums";

import Context from "../../../Context";
import { ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";

import AcquireItem from "./AcquireItem";

export default class AcquireItemForAction extends Objective {

	private static readonly cache: Map<ActionType, ItemType[]> = new Map();

	constructor(private readonly actionType: ActionType) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemForAction:${ActionType[this.actionType]}`;
	}

	public getStatus(): string {
		return `Acquiring an item to use for ${Translation.nameOf(Dictionary.Action, this.actionType).inContext(TextContext.Lowercase).getString()} action`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.getItems().some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return this.getItems()
			.map(item => [new AcquireItem(item).passContextDataKey(this)]);
	}

	private getItems(): ItemType[] {
		let result = AcquireItemForAction.cache.get(this.actionType);
		if (result === undefined) {
			result = [];

			for (const it of Enums.values(ItemType)) {
				const itemDescription = Items[it];
				if (itemDescription && itemDescription.use !== undefined && itemDescription.use.includes(this.actionType)) {
					result.push(it);
				}
			}

			AcquireItemForAction.cache.set(this.actionType, result);
		}

		return result;
	}
}
