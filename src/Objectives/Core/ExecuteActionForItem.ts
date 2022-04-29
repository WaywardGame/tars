import Stream from "@wayward/goodstream/Stream";
import type ActionExecutor from "game/entity/action/ActionExecutor";
import type actionDescriptions from "game/entity/action/Actions";
import type { IActionDescription } from "game/entity/action/IAction";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import type { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import Dictionary from "language/Dictionary";
import { ListEnder } from "language/ITranslation";
import Translation from "language/Translation";
import TileHelpers from "utilities/game/TileHelpers";
import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { ReserveType } from "../../core/ITars";
import Item from "game/item/Item";

export enum ExecuteActionType {
	Generic,
	Doodad,
	Terrain,
	Corpse,
}

export interface IExecuteActionForItemOptions<T extends ActionType> {
	onlyAllowHarvesting: boolean;
	onlyGatherWithHands: boolean;

	moveAllMatchingItems: boolean;

	actionType: ActionType;
	executor: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never)) => void
}

export default class ExecuteActionForItem<T extends ActionType> extends Objective {

	private terrainTileType: TerrainType | undefined;

	constructor(
		private readonly type: ExecuteActionType,
		private readonly itemTypes: ItemType[],
		private readonly options?: Partial<IExecuteActionForItemOptions<T>>) {
		super();
	}

	public getIdentifier(): string {
		return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.options?.actionType !== undefined ? `:${ActionType[this.options.actionType]}` : ""}`;
	}

	public getStatus(): string | undefined {
		if (this.itemTypes.length > 1) {
			const translation = Stream.values(Array.from(new Set(this.itemTypes)).map(itemType => Translation.nameOf(Dictionary.Item, itemType)))
				.collect(Translation.formatList, ListEnder.Or);

			return `Acquiring ${translation.getString()}`;
		}

		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemTypes[0]).getString()}`;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		// settings this here screws up AcquireWaterContainer
		// only set this once we get the item

		// ! updated comment: this must be there !
		// example: AcquireItemWithRecipe -> IgniteItem 
		// it should set LastAcquiredItem to undefined, then IgnoreItem will return .Restart
		// without this, LastAcquiredItem might be some other item before the AcquireItemWithRecipe craft, which would break Ignite
		context.setData(this.contextDataKey, undefined);

		if (context.calculatingDifficulty) {
			return 0;
		}

		const tile = context.human.getFacingTile();
		const tileType = TileHelpers.getType(tile);

		const terrainDescription = Terrains[tileType];
		if (!terrainDescription) {
			return ObjectiveResult.Impossible;
		}

		if (this.terrainTileType === undefined) {
			this.terrainTileType = tileType;

		} else if (this.terrainTileType !== tileType) {
			// tile type changed, give up
			return ObjectiveResult.Restart;
		}

		let actionType: ActionType;
		const actionArguments: any[] = [];

		switch (this.type) {
			case ExecuteActionType.Doodad:
				const doodad = tile.doodad;
				if (!doodad) {
					return ObjectiveResult.Restart;
				}

				const description = doodad.description();
				if (!description) {
					return ObjectiveResult.Restart;
				}

				if (!context.utilities.tile.canGather(context, tile, true)) {
					return ObjectiveResult.Restart;
				}

				if (doodad.canHarvest()) {
					actionType = ActionType.Harvest;

				} else if (doodad.isGatherable()) {
					actionType = ActionType.Chop;

				} else {
					return ObjectiveResult.Restart;
				}

				if (this.options?.onlyAllowHarvesting && actionType !== ActionType.Harvest) {
					return ObjectiveResult.Restart;
				}

				if (this.options?.onlyGatherWithHands) {
					// tool, bypass
					actionArguments.push(undefined, true);

				} else {
					actionArguments.push(context.utilities.item.getBestToolForDoodadGather(context, doodad));
				}

				break;

			case ExecuteActionType.Terrain:
				actionType = terrainDescription.gather ? ActionType.Mine : ActionType.Dig;

				if (actionType === ActionType.Dig && !context.utilities.tile.canDig(context, tile)) {
					return ObjectiveResult.Restart;
				}

				actionArguments.push(context.utilities.item.getBestToolForTerrainGather(context, tileType));

				break;

			case ExecuteActionType.Corpse:
				const tool = context.utilities.item.getBestTool(context, ActionType.Butcher);

				if (tool === undefined || !context.utilities.tile.canButcherCorpse(context, tile)) {
					return ObjectiveResult.Restart;
				}

				actionType = ActionType.Butcher;
				actionArguments.push(tool);

				break;

			case ExecuteActionType.Generic:
				if (this.options?.actionType === undefined) {
					this.log.error("Invalid action type");
					return ObjectiveResult.Impossible;
				}

				actionType = this.options.actionType;
				break;

			default:
				return ObjectiveResult.Complete;
		}

		const result = await this.executeActionForItem(context, this.itemTypes, actionType, ((context: Context, action: any) => {
			if (this.options?.executor) {
				this.options.executor(context, action);

			} else {
				action.execute(context.actionExecutor, ...actionArguments);
			}
		}) as any);

		// console.log("Result", ObjectiveResult[result]);
		if (this.type === ExecuteActionType.Generic) {
			// never return undefined for generic - that would make it retry this objective with the same arguments
			return result === ObjectiveResult.Complete ? ObjectiveResult.Complete : ObjectiveResult.Restart;
		}

		return result;
	}

	protected override getBaseDifficulty(context: Context): number {
		return 1;
	}

	private async executeActionForItem<T extends ActionType>(
		context: Context,
		itemTypes: ItemType[],
		actionType: T,
		executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never) => void): Promise<ObjectiveResult> {
		let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, actionType, executor as any);
		if (matchingNewItem !== undefined) {
			this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id})`);

			if (this.reserveType === ReserveType.Soft) {
				context.addSoftReservedItems(matchingNewItem);

			} else {
				context.addHardReservedItems(matchingNewItem);
			}

			context.setData(this.contextDataKey, matchingNewItem);

			return ObjectiveResult.Complete;
		}

		const matchingTileItems = context.human.getTile().containedItems?.filter(item => itemTypes.includes(item.type));
		if (matchingTileItems !== undefined && matchingTileItems.length > 0) {
			const matchingNewItems: Item[] = [];

			for (let i = 0; i < (this.options?.moveAllMatchingItems ? matchingTileItems.length : 1); i++) {
				const itemToMove = matchingTileItems[i];

				const matchingItem = await this.executeActionCompareInventoryItems(context, itemTypes, ActionType.MoveItem, ((context: Context, action: any) => {
					action.execute(context.actionExecutor, itemToMove, context.human.inventory);
				}));
				if (matchingItem !== undefined) {
					matchingNewItems.push(matchingItem);
				}
			}

			if (matchingNewItems.length > 0) {
				const matchingNewItem = matchingNewItems[0];

				this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}) (via MoveItem)`);

				if (this.reserveType === ReserveType.Soft) {
					context.addSoftReservedItems(...matchingNewItems);

				} else {
					context.addHardReservedItems(...matchingNewItems);
				}

				context.setData(this.contextDataKey, matchingNewItem);

				return ObjectiveResult.Complete;
			}
		}

		context.setData(this.contextDataKey, undefined);

		return ObjectiveResult.Pending;
	}

	private async executeActionCompareInventoryItems<T extends ActionType>(
		context: Context,
		itemTypes: ItemType[],
		actionType: T,
		executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R, infer AV> ? ActionExecutor<A, E, R, AV> : never) => void) {
		const itemsBefore = context.human.inventory.containedItems.slice();

		await context.utilities.action.executeAction(context, actionType, executor as any);

		const newItems = context.human.inventory.containedItems.filter(item => !itemsBefore.includes(item));

		return newItems.find(item => itemTypes.includes(item.type));
	}
}
