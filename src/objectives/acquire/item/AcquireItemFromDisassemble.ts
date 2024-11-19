import type { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import Disassemble from "@wayward/game/game/entity/action/actions/Disassemble";
import { ItemType } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import Dictionary from "@wayward/game/language/Dictionary";
import { ListEnder } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";

import type { IDisassemblySearch } from "../../../core/ITars";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { ItemUtilities, RelatedItemType } from "../../../utilities/ItemUtilities";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ProvideItems from "../../core/ProvideItems";
import ReserveItems from "../../core/ReserveItems";
import UseProvidedItem from "../../core/UseProvidedItem";
import MoveItemsIntoInventory from "../../other/item/MoveItemsIntoInventory";
import CompleteRequirements from "../../utility/CompleteRequirements";
import MoveToLand from "../../utility/moveTo/MoveToLand";
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
		const translation = this.searches.map(({ item }) => item.getName())
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by disassembling ${translation.getString()}`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.Disassemble);
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.searches.some(({ item }) => context.isReservedItemType(item.type));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const { item, disassemblyItems, requiredForDisassembly } of this.searches) {
			if (context.isHardReservedItem(item) || item.isProtected() || !context.utilities.item.canDestroyItem(context, item)) {
				continue;
			}

			if (context.utilities.item.isInventoryItem(context, item)) {
				// allow diassembling a hoe when we're missing an axe or pick axe
				const canDisassemble = (item === context.inventory.hoe) && (!context.inventory.axe || !context.inventory.pickAxe);
				if (!canDisassemble) {
					continue;
				}
			}

			// Set addUniqueIdentifier to true because the pipeline may be ordered and it could run two of the same AcquireItemFromDismantle objectives one after another
			// ex: SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:289:Log] -> ExecuteAction:MoveItem:11732 -> SetContextData:AcquireItemFromDismantle:TreeBark:Log:[Item:316:Log] -> ExecuteAction:MoveItem:11742 -> ExecuteActionForItem:Generic:Dismantle:11731 -> ExecuteActionForItem:Generic:Dismantle:11710
			// this.setExtraHashCode(item.toString());

			const itemContextDataKey = this.getUniqueContextDataKey("Disassemble");

			const objectives: IObjective[] = [
				new ReserveItems(item),
				new ProvideItems(...disassemblyItems.map(item => item.type)),
				new SetContextData(itemContextDataKey, item),
				new MoveItemsIntoInventory(item),
			];

			let requiredItemHashCodes: string[] | undefined;

			if (requiredForDisassembly) {
				requiredItemHashCodes = [];

				for (let i = 0; i < requiredForDisassembly.length; i++) {
					const requiredItemHashCode = requiredItemHashCodes[i] = this.getUniqueContextDataKey(`RequiredItem${i}`);

					const itemTypeOrGroup = requiredForDisassembly[i];

					const requiredItem = context.island.items.isGroup(itemTypeOrGroup) ?
						context.utilities.item.getItemInContainerByGroup(context, context.human.inventory, itemTypeOrGroup, { allowInventoryItems: true }) :
						context.utilities.item.getItemInContainer(context, context.human.inventory, itemTypeOrGroup, { allowInventoryItems: true });
					if (requiredItem) {
						objectives.push(new ReserveItems(requiredItem));
						objectives.push(new SetContextData(requiredItemHashCode, requiredItem));

					} else {
						objectives.push(
							(context.island.items.isGroup(itemTypeOrGroup) ?
								new AcquireItemByGroup(itemTypeOrGroup) :
								new AcquireItem(itemTypeOrGroup)).setContextDataKey(requiredItemHashCode));
					}
				}
			}

			if (context.human.isSwimming) {
				objectives.push(new MoveToLand());
			}

			objectives.push(new CompleteRequirements(context.island.items.hasAdditionalRequirements(context.human, item.type, undefined, true)));

			objectives.push(new ExecuteActionForItem(
				ExecuteActionType.Generic,
				[this.itemType],
				{
					genericAction: {
						action: Disassemble,
						args: context => {
							const item = context.getData<Item | undefined>(itemContextDataKey);
							if (!item?.isValid) {
								// treat this as an expected case
								// the item was likely broken earlier in the execution tree
								// this.log.warn(`Missing disassemble item "${item}". Bug in TARS pipeline, will fix itself. Hash code: ${hashCode}`);
								return ObjectiveResult.Restart;
							}

							let requiredItems: Item[] | undefined;

							if (requiredItemHashCodes) {
								for (const requiredItemHashCode of requiredItemHashCodes) {
									const item = context.getData<Item>(requiredItemHashCode);
									if (!item?.isValid) {
										// treat this as an expected case
										// the item was likely broken earlier in the execution tree
										// this.log.warn(`Missing required item "${item}" for disassembly. Bug in TARS pipeline, will fix itself. Hash code: ${requiredItemHashCode}`);
										return ObjectiveResult.Restart;
									}

									requiredItems?.push(item);
								}
							}

							return [item, requiredItems] as ActionArgumentsOf<typeof Disassemble>;
						},
					},
				}).passAcquireData(this).setStatus(() => `Disassembling ${item.getName().getString()}`));

			objectives.push(new UseProvidedItem(this.itemType));

			objectivePipelines.push(objectives);
		}

		return objectivePipelines;
	}

	protected override getBaseDifficulty(context: Context): number {
		// High base difficulty because we prefer to not disassemble things.
		// it should really take into account the scarcity of the item being disassembled
		return 5;
	}
}
