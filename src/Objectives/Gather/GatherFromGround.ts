import { ActionType } from "entity/action/IAction";
import { ItemType } from "item/IItem";
import { IVector3 } from "utilities/math/IVector";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import SetContextData from "../ContextData/SetContextData";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import ReserveItems from "../Core/ReserveItems";

export default class GatherFromGround extends Objective {

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromGround:${ItemType[this.itemType]}`;
	}

	public canGroupTogether(): boolean {
		return true;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		return context.isReservedItemType(this.itemType);
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const tile = context.player.getTile();
		const items = tile.containedItems;
		if (items !== undefined) {
			for (const item of items) {
				if (item.type === this.itemType && !context.isReservedItem(item)) {
					return [
						new ReserveItems(item),
						new SetContextData(this.contextDataKey, item),
						new ExecuteAction(ActionType.MoveItem, (context, action) => {
							action.execute(context.player, item, context.player.inventory);
						}).setStatus(() => `Moving ${item.getName()} to inventory`),
					];
				}
			}
		}

		return island.items
			.map(item => {
				if (item && item.type === this.itemType && itemManager.isTileContainer(item.containedWithin) && !context.isReservedItem(item)) {
					return {
						item: item,
						point: item.containedWithin as any as IVector3,
					};
				}

				return undefined!;
			})
			.filter(itemInfo => itemInfo !== undefined)
			.map(({ item: itemOnGround, point }) => {
				const objectives: IObjective[] = [];

				// const weight = context.player.stat.get<IStatMax>(Stat.Weight);
				// if ((weight.value + itemOnGround.getTotalWeight()) > weight.max) {
				// 	// this.log.info("Reduce weight before picking up item");
				// 	objectives.push(new ReduceWeight());
				// }

				objectives.push(new MoveToTarget(point, true));

				objectives.push(new ReserveItems(itemOnGround));

				objectives.push(new Lambda(async context => {
					const objectives: IObjective[] = [];

					const item = context.player.getFacingTile().containedItems?.find(item => item.type === this.itemType);
					if (item) {
						objectives.push(new SetContextData(this.contextDataKey, item));
						objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
							action.execute(context.player, item, context.player.inventory);
						}).setStatus(() => `Moving ${item.getName()} to inventory`));
					}

					return objectives;
				}));

				return objectives;
			});
	}

	protected getBaseDifficulty(context: Context): number {
		return 6;
	}

}
