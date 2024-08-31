import { ItemType } from "@wayward/game/game/item/IItem";
import type Item from "@wayward/game/game/item/Item";
import type { ITileContainer } from "@wayward/game/game/tile/ITerrain";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import type Context from "../../core/context/Context";
import { ContextDataType } from "../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
import SetContextData from "../contextData/SetContextData";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";
import ReserveItems from "../core/ReserveItems";
import MoveItemsIntoInventory from "../other/item/MoveItemsIntoInventory";

export default class GatherFromGround extends Objective {

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IGatherItemOptions> = {}) {
		super();
	}

	public getIdentifier(context: Context | undefined): string {
		return `GatherFromGround:${ItemType[this.itemType]}:${context?.getData(ContextDataType.PrioritizeBaseItems)}`;
	}

	public getStatus(): string | undefined {
		return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from the ground`;
	}

	public override canGroupTogether(): boolean {
		return true;
	}

	// disabled at the moment because it will currently see that it's already reserved and skip it
	// public override isDynamic(): boolean {
	// 	// marked as dynamic because the plan is optimized before execution.
	// 	// that means this objective could end up regrouped.
	// 	// the specific objective in the tree might be aiming to gather from some far away place.
	// 	// running it dynamically will end up having it grab from the nearest spot
	// 	return true;
	// }

	public override canIncludeContextHashCode(context: Context, objectiveHashCode: string): { objectiveHashCode: string; itemTypes: Set<ItemType>; } {
		return {
			objectiveHashCode,
			itemTypes: new Set([this.itemType]),
		};
	}

	public override shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean {
		// it should cache this pipeline based on the reserved items by other GatherFromGround pipelines
		// example: why should this care about Sandstones that were gathered from a chest? things happening in chests won't affect the caching for this objective
		return context.isReservedItemType(this.itemType, objectiveHashCode);
	}

	public async execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult> {
		const prioritizeBaseItems = context.getData(ContextDataType.PrioritizeBaseItems);

		const item = context.human.tile.containedItems?.find(item => this.itemMatches(context, item));
		if (item) {
			const tile = item.island.getTileFromPoint(item.containedWithin as ITileContainer);

			return [
				new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
				new MoveToTarget(tile, false)
					.overrideDifficulty((prioritizeBaseItems && context.utilities.item.getBaseTileItems(context).has(item)) ? 5 : undefined)
					.trackItem(item), // used to ensure each GatherFromGround objective tree contains a MoveToTarget objective
				new SetContextData(this.contextDataKey, item),
				new MoveItemsIntoInventory(item, tile),
			];
		}

		return context.utilities.item.getGroundItems(context, this.itemType)
			.map(item => {
				if (item && this.itemMatches(context, item)) {
					return [
						new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
						new MoveToTarget(item.island.getTileFromPoint(item.containedWithin as ITileContainer), true)
							.overrideDifficulty((prioritizeBaseItems && context.utilities.item.getBaseTileItems(context).has(item)) ? 5 : undefined)
							.trackItem(item),
						new SetContextData(this.contextDataKey, item), // todo: this might be wrong
						new Lambda(async context => {
							const objectives: IObjective[] = [];

							// itemMatches must not check that the item is not reserved (because it is)
							const tile = context.human.facingTile;
							const item = tile.containedItems?.find(item => this.itemMatches(context, item, true));
							if (item) {
								objectives.push(new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode));
								objectives.push(new SetContextData(this.contextDataKey, item));
								objectives.push(new MoveItemsIntoInventory(item, tile));
							}

							return objectives;
						}).setStatus(this),
					];
				}

				return undefined;
			})
			.filter(objectives => objectives !== undefined) as IObjective[][];
	}

	protected override getBaseDifficulty(context: Context): number {
		return 6;
	}

	private itemMatches(context: Context, item: Item, fromLambda?: boolean): boolean {
		if (item.type !== this.itemType) {
			return false;
		}

		if (!fromLambda && (context.isHardReservedItem(item) || !context.island.items.isTileContainer(item.containedWithin))) {
			return false;
		}

		if (this.options.requiredMinDur !== undefined && (item.durability === undefined || item.durability < this.options.requiredMinDur)) {
			return false;
		}

		if (this.options.requirePlayerCreatedIfCraftable) {
			const canCraft = item.description?.recipe;
			if (canCraft && !item.crafterIdentifier) {
				return false;
			}
		}

		if (this.options.willDestroyItem && !context.utilities.item.canDestroyItem(context, item)) {
			return false;
		}

		return true;
	}
}
