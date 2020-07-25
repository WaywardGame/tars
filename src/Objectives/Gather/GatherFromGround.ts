import { ActionType } from "entity/action/IAction";
import { IStatMax, Stat } from "entity/IStats";
import { ItemType } from "item/IItem";
import { IVector3 } from "utilities/math/IVector";

import Context, { ContextDataType } from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import SetContextData from "../ContextData/SetContextData";
import ExecuteAction from "../Core/ExecuteAction";
import Lambda from "../Core/Lambda";
import MoveToTarget from "../Core/MoveToTarget";
import ReserveItems from "../Core/ReserveItems";
import ReduceWeight from "../Interrupt/ReduceWeight";

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
		if (tile.containedItems !== undefined && tile.containedItems.length > 0) {
			const item = tile.containedItems[tile.containedItems.length - 1];
			if (item.type === this.itemType && !context.isReservedItem(item)) {
				return [
					new ReserveItems(item),
					new SetContextData(ContextDataType.LastAcquiredItem, item),
					new ExecuteAction(ActionType.Idle, (context, action) => {
						action.execute(context.player);
					}),
				];
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

				const weight = context.player.stat.get<IStatMax>(Stat.Weight);
				if ((weight.value + itemOnGround.getTotalWeight()) > weight.max) {
					// this.log.info("Reduce weight before picking up item");
					objectives.push(new ReduceWeight());
				}

				objectives.push(new MoveToTarget(point, true));

				objectives.push(new ReserveItems(itemOnGround));

				objectives.push(new Lambda(async context => {
					const objectives: IObjective[] = [];

					const tile = context.player.getFacingTile();

					const containedItems = tile.containedItems;
					if (containedItems !== undefined && containedItems.length > 0) {
						// 100% legal
						const matchingItems = containedItems
							.filter(item => item.type === this.itemType);
						if (matchingItems.length > 0) {
							const item = matchingItems[0];

							objectives.push(new SetContextData(ContextDataType.LastAcquiredItem, item));

							objectives.push(new ExecuteAction(ActionType.MoveItem, (context, action) => {
								action.execute(context.player, item, context.player.inventory);
							}));
						}

						/*
						const firstItem = containedItems[containedItems.length - 1];
						if (firstItem.type === this.itemType) {
							objectives.push(new SetContextData(ContextDataType.LastAcquiredItem, firstItem));
							objectives.push(new ExecuteAction(ActionType.PickupItem, (context, action) => {
								action.execute(context.player);
							}));
	
						} else {
							const matchingItem = itemManager.getItemInContainer(tile as any, this.itemType);
							if (matchingItem) {
								objectives.push(new SetContextData(ContextDataType.LastAcquiredItem, matchingItem));
								objectives.push(new ExecuteAction(ActionType.PickupAllItems, (context, action) => {
									action.execute(context.player);
								}));
							}
						}
						*/
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
