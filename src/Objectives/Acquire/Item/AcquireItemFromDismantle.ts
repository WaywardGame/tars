import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";
import Item from "item/Item";
import { itemDescriptions } from "item/Items";
import { Dictionary } from "language/Dictionaries";
import Translation, { ListEnder } from "language/Translation";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { getItemInInventory } from "../../../Utilities/Item";
import SetContextData from "../../ContextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../Core/ExecuteActionForItem";
import ReserveItems from "../../Core/ReserveItems";
import MoveToLand from "../../Utility/MoveToLand";

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

	public getStatus(): string {
		if (this.dismantleItemTypes.length > 1) {
			const translation = Stream.values(Array.from(new Set(this.dismantleItemTypes)).map(itemType => Translation.nameOf(Dictionary.Item, itemType)))
				.collect(Translation.formatList, ListEnder.Or);

			return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by dismantling ${translation.getString()}`;
		}

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by dismantling ${Translation.nameOf(Dictionary.Item, this.dismantleItemTypes[0]).getString()}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.dismantleItemTypes.some(itemType => context.isReservedItemType(itemType));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const itemType of this.dismantleItemTypes) {
			const description = itemDescriptions[itemType];
			if (!description || !description.dismantle) {
				continue;
			}

			const dismantleItem = getItemInInventory(context, itemType);
			const hasRequirements = description.dismantle.required === undefined || itemManager.getItemForHuman(context.player, description.dismantle.required, false) !== undefined;

			const objectives: IObjective[] = [
				new SetContextData(ContextDataType.AllowOrganizingReservedItemsIntoIntermediateChest, false),
				new SetContextData(ContextDataType.NextActionAllowsIntermediateChest, false),
			];

			const hashCode = this.getHashCode();

			if (dismantleItem === undefined) {
				objectives.push(new AcquireItem(itemType).setContextDataKey(hashCode));

			} else {
				objectives.push(new ReserveItems(dismantleItem));
				objectives.push(new SetContextData(hashCode, dismantleItem));
			}

			if (!hasRequirements) {
				objectives.push(new AcquireItemByGroup(description.dismantle.required!));
			}

			if (context.player.swimming) {
				objectives.push(new MoveToLand());
			}

			objectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [this.itemType], ActionType.Dismantle, (context, action) => {
				const item = context.getData<Item>(hashCode);
				if (!item) {
					this.log.warn("Missing dismantle item. Bug in TARS pipeline, will fix itself", item, hashCode);
					return;
				}

				action.execute(context.player, item);
			}).setStatus(() => `Dismantling ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}

	protected getBaseDifficulty(context: Context): number {
		// High base difficulty because we prefer to not dismantle things. Sometimes we want to keep logs until we really need them
		return 18;
	}
}
