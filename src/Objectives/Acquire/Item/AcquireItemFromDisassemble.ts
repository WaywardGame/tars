import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { Dictionary } from "language/Dictionaries";
import Translation, { ListEnder } from "language/Translation";
import { RequirementStatus } from "game/item/IItemManager";

import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import Objective from "../../../Objective";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ReserveItems from "../../core/ReserveItems";
import CompleteRequirements from "../../utility/CompleteRequirements";
import MoveToLand from "../../utility/MoveToLand";
import ProvideItems from "../../core/ProvideItems";
import { IDisassemblySearch } from "../../../ITars";
import { itemUtilities } from "../../../utilities/Item";
import MoveItemIntoInventory from "../../other/item/MoveItemIntoInventory";
import AcquireItem from "./AcquireItem";
import AcquireItemByGroup from "./AcquireItemByGroup";

/**
 * Disassembles one of the items.
 * 
 * It will end up disassembling the easiest item that can be acquired.
 */
export default class AcquireItemFromDisassemble extends Objective {

	constructor(private readonly itemType: ItemType, private readonly searches: IDisassemblySearch[]) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItemFromDisassemble:${ItemType[this.itemType]}:${this.searches.map(({ item }) => item.toString()).join(",")}`;
	}

	public getStatus(): string | undefined {
		const translation = Stream.values(this.searches.map(({ item }) => item.getName()))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by disassembling ${translation.getString()}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return this.searches.some(({ item }) => context.isReservedItemType(item.type));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const { item, disassemblyItems, requiredForDisassembly } of this.searches) {
			if (context.isHardReservedItem(item)) {
				continue;
			}

			if (itemUtilities.isInventoryItem(context, item)) {
				// allow diassembling a hoe when we're missing an axe or pick axe
				if (item !== context.inventory.hoe || (context.inventory.axe && context.inventory.pickAxe)) {
					continue;
				}
			}

			// Set addUniqueIdentifier to true because the pipeline may be ordered and it could run two of the same AcquireItemFromDismantle objectives one after another
			// ex: SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:289:Log] -> ExecuteAction:MoveItem:11732 -> SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:316:Log] -> ExecuteAction:MoveItem:11742 -> ExecuteActionForItem:Generic:Dismantle:11731 -> ExecuteActionForItem:Generic:Dismantle:11710
			const hashCode = this.getHashCode(true);

			const objectives: IObjective[] = [
				new ReserveItems(item),
				new ProvideItems(...disassemblyItems.map(item => item.type)),
				new SetContextData(hashCode, item),
				new MoveItemIntoInventory(item),
			];

			if (requiredForDisassembly) {
				for (const itemTypeOfGroup of requiredForDisassembly) {
					if (!itemManager.getItemForHuman(context.player, itemTypeOfGroup)) {
						objectives.push(itemManager.isGroup(itemTypeOfGroup) ? new AcquireItemByGroup(itemTypeOfGroup) : new AcquireItem(itemTypeOfGroup));
					}
				}
			}

			if (context.player.isSwimming()) {
				objectives.push(new MoveToLand());
			}

			const requirementInfo = itemManager.hasAdditionalRequirements(context.player, item.type, undefined, undefined, true);
			if (requirementInfo.requirements === RequirementStatus.Missing) {
				this.log.info("Disassemble requirements not met");
				objectives.push(new CompleteRequirements(requirementInfo));
			}

			objectives.push(new ExecuteActionForItem(ExecuteActionType.Generic, [this.itemType], ActionType.Disassemble, (context, action) => {
				const item = context.getData<Item>(hashCode);
				if (!item) {
					this.log.warn("Missing disassemble item. Bug in TARS pipeline, will fix itself", item, hashCode);
					return;
				}

				action.execute(context.player, item);
			}).passAcquireData(this).setStatus(() => `Disassembling ${item.getName().getString()}`));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}

	protected getBaseDifficulty(context: Context): number {
		// High base difficulty because we prefer to not disassemble things.
		// it should really take into account the scarcity of the item being disassembled
		return 5;
	}
}
