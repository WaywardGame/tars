import Stream from "@wayward/goodstream/Stream";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { RequirementStatus } from "game/item/IItemManager";
import type Item from "game/item/Item";
import Dictionary from "language/Dictionary";
import { ListEnder } from "language/ITranslation";
import Translation from "language/Translation";
import type Context from "../../../core/context/Context";
import type { IDisassemblySearch } from "../../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import { ItemUtilities } from "../../../utilities/Item";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import ProvideItems from "../../core/ProvideItems";
import ReserveItems from "../../core/ReserveItems";
import MoveItemIntoInventory from "../../other/item/MoveItemIntoInventory";
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
		const translation = Stream.values(this.searches.map(({ item }) => item.getName()))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} by disassembling ${translation.getString()}`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypes(this.itemType);
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return this.searches.some(({ item }) => context.isReservedItemType(item.type));
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const { item, disassemblyItems, requiredForDisassembly } of this.searches) {
			if (context.isHardReservedItem(item) || item.isProtected()) {
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
			const hashCode = this.getHashCode(context, true);

			// probably doesn't fix a bug
			// const hashCode = `${this.getHashCode()}:${this.getUniqueIdentifier()}`

			const objectives: IObjective[] = [
				new ReserveItems(item),
				new ProvideItems(...disassemblyItems.map(item => item.type)),
				new SetContextData(hashCode, item),
				new MoveItemIntoInventory(item),
			];

			let requiredItemHashCodes: string[] | undefined;

			if (requiredForDisassembly) {
				requiredItemHashCodes = [];

				for (let i = 0; i < requiredForDisassembly.length; i++) {
					const requiredItemHashCode = requiredItemHashCodes[i] = `${this.getHashCode(context)}:${this.getUniqueIdentifier()}`;

					const itemTypeOrGroup = requiredForDisassembly[i];

					const requiredItem = context.island.items.isGroup(itemTypeOrGroup) ?
						context.utilities.item.getItemInContainerByGroup(context, context.human.inventory, itemTypeOrGroup, true) :
						context.utilities.item.getItemInContainer(context, context.human.inventory, itemTypeOrGroup, true);
					if (requiredItem === undefined) {
						objectives.push(
							(context.island.items.isGroup(itemTypeOrGroup) ?
								new AcquireItemByGroup(itemTypeOrGroup) :
								new AcquireItem(itemTypeOrGroup)).setContextDataKey(requiredItemHashCode));

					} else {
						objectives.push(new ReserveItems(requiredItem));
						objectives.push(new SetContextData(requiredItemHashCode, requiredItem));
					}
				}
			}

			if (context.human.isSwimming()) {
				objectives.push(new MoveToLand());
			}

			const requirementInfo = context.island.items.hasAdditionalRequirements(context.human, item.type, undefined, undefined, true);
			if (requirementInfo.requirements === RequirementStatus.Missing) {
				this.log.info("Disassemble requirements not met");
				objectives.push(new CompleteRequirements(requirementInfo));
			}

			objectives.push(new ExecuteActionForItem(
				ExecuteActionType.Generic,
				[this.itemType],
				{
					actionType: ActionType.Disassemble,
					executor: (context, action) => {
						const item = context.getData<Item | undefined>(hashCode);
						if (!item?.isValid()) {
							this.log.warn(`Missing disassemble item "${item}". Bug in TARS pipeline, will fix itself. Hash code: ${hashCode}`);
							return;
						}

						let requiredItems: Array<Item> | undefined;

						if (requiredItemHashCodes) {
							for (const requiredItemHashCode of requiredItemHashCodes) {
								const item = context.getData<Item>(requiredItemHashCode);
								if (!item?.isValid()) {
									this.log.warn(`Missing required item "${item}" for disassembly. Bug in TARS pipeline, will fix itself. Hash code: ${requiredItemHashCode}`);
									return;
								}

								requiredItems?.push(item);
							}
						}

						action.execute(context.actionExecutor, item, requiredItems);
					},
				}).passAcquireData(this).setStatus(() => `Disassembling ${item.getName().getString()}`));

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
