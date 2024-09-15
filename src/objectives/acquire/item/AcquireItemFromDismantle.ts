import { ActionArgumentsOf, ActionType } from "@wayward/game/game/entity/action/IAction";
import Dismantle from "@wayward/game/game/entity/action/actions/Dismantle";
import { ItemType } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";
import Dictionary from "@wayward/game/language/Dictionary";
import { ListEnder, TextContext } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { ItemUtilities, RelatedItemType } from "../../../utilities/ItemUtilities";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ReserveItems from "../../core/ReserveItems";
import MoveToLand from "../../utility/moveTo/MoveToLand";
import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

/**
 * Dismantles one of the item types.
 * 
 * It will end up dismantling the easiest item that can be acquired.
 */
export default class AcquireItemFromDismantle extends Objective {

	constructor(private readonly itemType: ItemType, private readonly dismantleItemTypes: Set<ItemType>) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemFromDismantle:${ItemType[this.itemType]}:${Array.from(this.dismantleItemTypes).map((itemType: ItemType) => ItemType[itemType]).join(",")}`;
	}

	public getStatus(): string | undefined {
		const translation = Array.from(this.dismantleItemTypes)
			.map(itemType => Translation.nameOf(Dictionary.Item, itemType))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.Dismantle);
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		for (const itemType of this.dismantleItemTypes) {
			if (context.isReservedItemType(itemType)) {
				return true;
			}
		}

		return false;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const itemType of this.dismantleItemTypes) {
			const description = itemDescriptions[itemType];
			if (!description || !description.dismantle) {
				continue;
			}

			// todo: integrate canDestroyItem into this method as another arg
			const dismantleItem = context.utilities.item.getItemInInventory(context, itemType);

			const objectives: IObjective[] = [
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new SetContextData(ContextDataType.NextActionAllowsIntermediateChest, false),
			];

			// Set addUniqueIdentifier to true because the pipeline may be ordered and it could run two of the same AcquireItemFromDismantle objectives one after another
			// ex: SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:289:Log] -> ExecuteAction:MoveItem:11732 -> SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:316:Log] -> ExecuteAction:MoveItem:11742 -> ExecuteActionForItem:Generic:Dismantle:11731 -> ExecuteActionForItem:Generic:Dismantle:11710
			// this.setExtraHashCode(ItemType[itemType]);

			const itemContextDataKey = this.getUniqueContextDataKey("Dismantle");

			if (dismantleItem && context.utilities.item.canDestroyItem(context, dismantleItem)) {
				objectives.push(new ReserveItems(dismantleItem));
				objectives.push(new SetContextData(itemContextDataKey, dismantleItem));

			} else {
				objectives.push(new AcquireItem(itemType, { willDestroyItem: true }).setContextDataKey(itemContextDataKey));
			}

			let requiredItemHashCode: string | undefined;
			let requiredItem: Item | undefined;

			if (description.dismantle.required !== undefined) {
				requiredItemHashCode = this.getUniqueContextDataKey("RequiredItem");

				requiredItem = context.island.items.getItemForHuman(context.human, description.dismantle.required, {
					excludeProtectedItems: true,
					includeProtectedItemsThatWillNotBreak: ActionType.Dismantle,
				});

				if (requiredItem) {
					objectives.push(new ReserveItems(requiredItem));
					objectives.push(new SetContextData(requiredItemHashCode, requiredItem));

				} else {
					objectives.push(new AcquireItemByGroup(description.dismantle.required).setContextDataKey(requiredItemHashCode));
				}
			}

			if (context.human.isSwimming) {
				objectives.push(new MoveToLand());
			}

			objectives.push(new ExecuteActionForItem(
				ExecuteActionType.Generic,
				[this.itemType],
				{
					genericAction: {
						action: Dismantle,
						args: (context) => {
							const item = context.getData<Item>(itemContextDataKey);
							if (!item?.isValid) {
								// treat this as an expected case
								// the item was likely broken earlier in the execution tree
								// this.log.warn(`Missing dismantle item ${item}. Bug in TARS pipeline, will fix itself`, hashCode);
								return ObjectiveResult.Restart;
							}

							let requiredItem: Item | undefined;
							if (requiredItemHashCode) {
								requiredItem = context.getData<Item>(requiredItemHashCode);
								if (requiredItem && !requiredItem.isValid) {
									// treat this as an expected case
									// the item was likely broken earlier in the execution tree
									// this.log.warn(`Missing required item "${requiredItem}" for dismantle. Bug in TARS pipeline, will fix itself. Hash code: ${requiredItemHashCode}`);
									return ObjectiveResult.Restart;
								}
							}

							return [item, requiredItem] as ActionArgumentsOf<typeof Dismantle>;
						},
					},
				}).passAcquireData(this).setStatus(() => `Dismantling ${Translation.nameOf(Dictionary.Item, itemType).inContext(TextContext.Lowercase).getString()} for ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}

	protected override getBaseDifficulty(context: Context): number {
		// High base difficulty because we prefer to not dismantle things. Sometimes we want to keep logs until we really need them
		// but not too high because sometimes we end up with dozens of logs while trying to look for stripped bark..
		// it should really take into account the scarcity of the item being dismantled
		return 5;
	}
}
