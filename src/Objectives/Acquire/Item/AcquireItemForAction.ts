import { ActionType } from "game/entity/action/IAction";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import { itemDescriptions as Items } from "game/item/Items";
import Dictionary from "language/Dictionary";
import { TextContext } from "language/ITranslation";
import Translation from "language/Translation";
import Enums from "utilities/enum/Enums";
import type Context from "../../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return AcquireItemForAction.getItems(context, this.actionType).some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		return AcquireItemForAction.getItems(context, this.actionType)
			.map(item => [new AcquireItem(item).passAcquireData(this)]);
	}

	public static getItems(context: Context, actionType: ActionType): ItemType[] {
		let result = AcquireItemForAction.cache.get(actionType);
		if (result === undefined) {
			result = [];

			for (const it of Enums.values(ItemType)) {
				const itemDescription = Items[it];
				if (itemDescription && itemDescription.use !== undefined && itemDescription.use.includes(actionType)) {
					if (actionType === ActionType.StartFire) {
						// prefer fire starter items
						// don't use torches
						if (context.island.items.isInGroup(it, ItemTypeGroup.LitTorch)) {
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
