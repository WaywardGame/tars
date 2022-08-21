import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITileContainer } from "game/tile/ITerrain";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import type Context from "../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import type { IGatherItemOptions } from "../acquire/item/AcquireBase";
import SetContextData from "../contextData/SetContextData";
import Lambda from "../core/Lambda";
import MoveToTarget from "../core/MoveToTarget";
import ReserveItems from "../core/ReserveItems";
import MoveItem from "../other/item/MoveItem";

export default class GatherFromGround extends Objective {

	public readonly gatherObjectivePriority = 500;

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IGatherItemOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromGround:${ItemType[this.itemType]}`;
	}

	public getStatus(): string | undefined {
		return `Gathering ${Translation.nameOf(Dictionary.Item, this.itemType).getString()} from the ground`;
	}

	public override canGroupTogether(): boolean {
		return true;
	}

	public override canIncludeContextHashCode(context: Context, objectiveHashCode: string) {
		return {
			objectiveHashCode,
			itemTypes: new Set([this.itemType]),
		};
	}

	public override shouldIncludeContextHashCode(context: Context, objectiveHashCode: string): boolean {
		// todo: it should cache this pipeline based on the reserved items by other GatherFromGround pipelines
		// example: why should this care about Sandstones that were gathered from a chest? things happening in chests won't affect the caching for this objective
		return context.isReservedItemType(this.itemType, objectiveHashCode);
	}

	public async execute(context: Context, objectiveHashCode: string): Promise<ObjectiveExecutionResult> {
		const point = context.human.getPoint();
		const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item));
		if (item) {
			return [
				new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
				new MoveToTarget(item.containedWithin as ITileContainer, false).trackItem(item), // used to ensure each GatherFromGround objective tree contains a MoveToTarget objective
				new SetContextData(this.contextDataKey, item),
				new MoveItem(item, context.human.inventory, point),
			];
		}

		return context.utilities.item.getGroundItems(context, this.itemType)
			.map(item => {
				if (item && this.itemMatches(context, item)) {
					return [
						new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode),
						new MoveToTarget(item.containedWithin as ITileContainer, true).trackItem(item),
						new SetContextData(this.contextDataKey, item), // todo: this might be wrong
						new Lambda(async context => {
							const objectives: IObjective[] = [];

							// itemMatches must not check that the item is not reserved (because it is)
							const point = context.human.getFacingPoint();
							const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item, true));
							if (item) {
								objectives.push(new ReserveItems(item).passAcquireData(this).passObjectiveHashCode(objectiveHashCode));
								objectives.push(new SetContextData(this.contextDataKey, item));
								objectives.push(new MoveItem(item, context.human.inventory, point));
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

		if (this.options.requiredMinDur !== undefined && (item.minDur === undefined || item.minDur < this.options.requiredMinDur)) {
			return false;
		}

		if (this.options.requirePlayerCreatedIfCraftable) {
			const canCraft = item.description()?.recipe;
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
