import Doodad from "game/doodad/Doodad";
import { IContainer, ItemType } from "game/item/IItem";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { IGatherItemOptions } from "../acquire/item/AcquireBase";
import SetContextData from "../contextData/SetContextData";
import ReserveItems from "../core/ReserveItems";
import MoveItemIntoInventory from "../other/item/MoveItemIntoInventory";

export default class GatherFromChest extends Objective {

	// don't reorder these
	// public readonly isGatherObjective = true;

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IGatherItemOptions> = {}) {
		super();
	}

	public getIdentifier(context?: Context): string {
		return `GatherFromChest:${ItemType[this.itemType]}:${context?.getData(ContextDataType.PrioritizeBaseChests)}:${context?.getData(ContextDataType.NextActionAllowsIntermediateChest)}`;
	}

	public getStatus(): string | undefined {
		return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from a chest`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	// we can't group this together because gatherfromchest objectives are prioritized to be ran last
	// public canGroupTogether(): boolean {
	// 	return true;
	// }

	// todo: add getWeightChange(): number and take that into account when grouping together?

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return context.isReservedItemType(this.itemType);
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const prioritizeBaseChests = context.getData(ContextDataType.PrioritizeBaseChests);

		let chests: Doodad[] = context.base.chest.slice();

		if (!context.getData(ContextDataType.NextActionAllowsIntermediateChest)) {
			// the intermediate chest cannot be used for the recipe
			// allow using gathering items from it
			chests = chests.concat(context.base.intermediateChest);
		}

		return chests
			.map(chest => {
				const items = context.island.items.getItemsInContainerByType(chest as IContainer, this.itemType, true)
					.filter(item => {
						if (context.isHardReservedItem(item)) {
							return false;
						}

						if (this.options.requiredMinDur !== undefined && (item.minDur === undefined || item.minDur < this.options.requiredMinDur)) {
							return false;
						}

						if (this.options.requirePlayerCreatedIfCraftable) {
							const canCraft = item.description()?.recipe;
							if (canCraft && !item.ownerIdentifier) {
								return false;
							}
						}

						return true;
					});
				if (items.length > 0) {
					const item = items[0];
					return [
						new ReserveItems(item).passAcquireData(this),
						new SetContextData(this.contextDataKey, item),
						new MoveItemIntoInventory(item).overrideDifficulty(prioritizeBaseChests ? 5 : undefined),
					];
				}

				return undefined;
			})
			.filter(objectives => objectives !== undefined) as IObjective[][];
	}
}
