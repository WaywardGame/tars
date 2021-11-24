import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ITileContainer } from "game/tile/ITerrain";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import Objective from "../../Objective";
import { IGatherItemOptions } from "../acquire/item/AcquireBase";
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

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		return context.isReservedItemType(this.itemType);
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const point = context.player.getPoint();
		const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item));
		if (item) {
			return [
				new ReserveItems(item).passAcquireData(this),
				new MoveToTarget(item.containedWithin as ITileContainer, false), // used to ensure each GatherFromGround objective tree contains a MoveToTarget objective
				new SetContextData(this.contextDataKey, item),
				new MoveItem(item, context.player.inventory, point),
			];
		}

		return context.island.items.getObjects()
			.map(item => {
				if (item && this.itemMatches(context, item)) {
					return [
						new ReserveItems(item).passAcquireData(this),
						new MoveToTarget(item.containedWithin as ITileContainer, true),
						new SetContextData(this.contextDataKey, item), // todo: this might be wrong
						new Lambda(async context => {
							const objectives: IObjective[] = [];

							// itemMatches must not check that the item is not reserved (because it is)
							const point = context.player.getFacingPoint();
							const item = context.island.getTileFromPoint(point).containedItems?.find(item => this.itemMatches(context, item, true));
							if (item) {
								objectives.push(new ReserveItems(item).passAcquireData(this));
								objectives.push(new SetContextData(this.contextDataKey, item));
								objectives.push(new MoveItem(item, context.player.inventory, point));
							}

							return objectives;
						}),
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
		return item.type === this.itemType &&
			(fromLambda || (context.island.items.isTileContainer(item.containedWithin) && !context.isHardReservedItem(item))) &&
			(this.options.requiredMinDur === undefined || (item.minDur !== undefined && item.minDur >= this.options.requiredMinDur));
	}
}
