import Doodad from "game/doodad/Doodad";
import { ActionType } from "game/entity/action/IAction";
import { IContainer, ItemType } from "game/item/IItem";
import Context from "../../Context";
import { ContextDataType } from "../../IContext";
import { ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import SetContextData from "../ContextData/SetContextData";
import ExecuteAction from "../Core/ExecuteAction";
import MoveToTarget from "../Core/MoveToTarget";
import ReserveItems from "../Core/ReserveItems";


export default class GatherFromChest extends Objective {

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getIdentifier(context?: Context): string {
		return `GatherFromChest:${ItemType[this.itemType]}:${context?.getData(ContextDataType.PrioritizeBaseChests)}:${context?.getData(ContextDataType.NextActionAllowsIntermediateChest)}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	// we can't group this together because gatherfromchest objectives are prioritized to be ran last
	// public canGroupTogether(): boolean {
	// 	return true;
	// }

	// todo: add getWeightChange(): number and take that into account when grouping together?

	public shouldIncludeContextHashCode(context: Context): boolean {
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
			.map(chest => ({
				chest: chest,
				items: itemManager.getItemsInContainerByType(chest as IContainer, this.itemType, true)
					.filter(item => !context.isReservedItem(item)),
			}))
			.filter(chestInfo => chestInfo.items.length > 0)
			.map(({ chest, items }) => {
				const item = items[0];
				return [
					new MoveToTarget(chest, true).overrideDifficulty(prioritizeBaseChests ? 5 : undefined),
					new ReserveItems(item),
					new SetContextData(this.contextDataKey, item),
					new ExecuteAction(ActionType.MoveItem, (context, action) => {
						action.execute(context.player, item, context.player.inventory);
					}).setStatus(() => `Moving ${item.getName()} to inventory`),
				];
			});
	}
}
