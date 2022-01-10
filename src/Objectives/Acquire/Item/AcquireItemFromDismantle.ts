import Stream from "@wayward/goodstream/Stream";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import { itemDescriptions } from "game/item/Items";
import Dictionary from "language/Dictionary";
import { ListEnder } from "language/ITranslation";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
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

	constructor(private readonly itemType: ItemType, private readonly dismantleItemTypes: ItemType[]) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemFromDismantle:${ItemType[this.itemType]}:${this.dismantleItemTypes.map((itemType: ItemType) => ItemType[itemType]).join(",")}`;
	}

	public getStatus(): string | undefined {
		const translation = Stream.values(Array.from(new Set(this.dismantleItemTypes)).map(itemType => Translation.nameOf(Dictionary.Item, itemType)))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.dismantleItemTypes.some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const itemType of this.dismantleItemTypes) {
			const description = itemDescriptions[itemType];
			if (!description || !description.dismantle) {
				continue;
			}

			const dismantleItem = context.utilities.item.getItemInInventory(context, itemType);
			const hasRequirements = description.dismantle.required === undefined || context.island.items.getItemForHuman(context.player, description.dismantle.required, false) !== undefined;

			const objectives: IObjective[] = [
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new SetContextData(ContextDataType.NextActionAllowsIntermediateChest, false),
			];

			// Set addUniqueIdentifier to true because the pipeline may be ordered and it could run two of the same AcquireItemFromDismantle objectives one after another
			// ex: SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:289:Log] -> ExecuteAction:MoveItem:11732 -> SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:316:Log] -> ExecuteAction:MoveItem:11742 -> ExecuteActionForItem:Generic:Dismantle:11731 -> ExecuteActionForItem:Generic:Dismantle:11710
			const hashCode = this.getHashCode(true);

			if (dismantleItem === undefined) {
				objectives.push(new AcquireItem(itemType).setContextDataKey(hashCode));

			} else {
				objectives.push(new ReserveItems(dismantleItem));
				objectives.push(new SetContextData(hashCode, dismantleItem));
			}

			if (!hasRequirements) {
				objectives.push(new AcquireItemByGroup(description.dismantle.required!));
			}

			if (context.player.isSwimming()) {
				objectives.push(new MoveToLand());
			}

			objectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [this.itemType], ActionType.Dismantle, (context, action) => {
				const item = context.getData<Item>(hashCode);
				if (!item?.isValid()) {
					this.log.warn(`Missing dismantle item ${item}. Bug in TARS pipeline, will fix itself`, hashCode);
					return;
				}

				action.execute(context.player, item);
			}).passAcquireData(this).setStatus(() => `Dismantling ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

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
