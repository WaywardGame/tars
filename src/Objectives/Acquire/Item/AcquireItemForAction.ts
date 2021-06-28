import { ActionType } from "game/entity/action/IAction";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
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

	public getStatus(): string | undefined {
		return `Acquiring an item to use for ${Translation.nameOf(Dictionary.Action, this.actionType).inContext(TextContext.Lowercase).getString()} action`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return AcquireItemForAction.getItems(this.actionType).some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		return AcquireItemForAction.getItems(this.actionType)
			.map(item => [new AcquireItem(item).passContextDataKey(this)]);
	}

	public static getItems(actionType: ActionType): ItemType[] {
		let result = AcquireItemForAction.cache.get(actionType);
		if (result === undefined) {
			result = [];

			for (const it of Enums.values(ItemType)) {
				const itemDescription = Items[it];
				if (itemDescription && itemDescription.use !== undefined && itemDescription.use.includes(actionType)) {
					if (actionType === ActionType.StartFire) {
						// prefer fire starter items
						// don't use torches
						if (itemManager.isInGroup(it, ItemTypeGroup.LitTorch)) {
							continue;
						}
					}

					result.push(it);
				}
			}

			AcquireItemForAction.cache.set(actionType, result);
		}

		return result;
	}
}
