import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";
import { itemDescriptions as Items } from "item/Items";
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
