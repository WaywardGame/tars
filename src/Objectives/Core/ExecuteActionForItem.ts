import ActionExecutor from "entity/action/ActionExecutor";
import actionDescriptions from "entity/action/Actions";
import { ActionType, IActionDescription } from "entity/action/IAction";
import { DamageType } from "entity/IEntity";
import { ItemType } from "item/IItem";
import { TerrainType } from "tile/ITerrain";
import Terrains from "tile/Terrains";
import TileHelpers from "utilities/TileHelpers";

import Context, { ContextDataType } from "../../Context";
import { ObjectiveExecutionResult, ObjectiveResult } from "../../IObjective";
import Objective from "../../Objective";
import { executeAction } from "../../Utilities/Action";
import { getBestActionItem, getInventoryItemsWithUse } from "../../Utilities/Item";
import { hasCorpses } from "../../Utilities/Tile";

export enum ExecuteActionType {
	Generic,
	Doodad,
	Terrain,
	Corpse,
}

export default class ExecuteActionForItem<T extends ActionType> extends Objective {

	private terrainTileType: TerrainType | undefined;

	constructor(
		private readonly type: ExecuteActionType,
		private readonly itemTypes: ItemType[],
		private readonly actionType?: T,
		private readonly executor?: (context: Context, action: ((typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never)) => void) {
		super();
	}

	public getIdentifier(): string {
		return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.actionType !== undefined ? `:${ActionType[this.actionType]}` : ""}`;
	}

	public isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		if (context.calculatingDifficulty) {
			return 0;
		}

		const tile = context.player.getFacingTile();
		const tileType = TileHelpers.getType(tile);

		const terrainDescription = Terrains[tileType];
		if (!terrainDescription) {
			return ObjectiveResult.Complete;
		}

		if (this.terrainTileType === undefined) {
			this.terrainTileType = tileType;

		} else if (this.terrainTileType !== tileType) {
			// tile type changed, give up
			return ObjectiveResult.Complete;
		}

		let actionType: ActionType;
		const actionArguments: any[] = [];

		switch (this.type) {
			case ExecuteActionType.Doodad:
				const doodad = tile.doodad;
				if (!doodad) {
					return ObjectiveResult.Complete;
				}

				const description = doodad.description();
				if (!description) {
					return ObjectiveResult.Complete;
				}

				const stage = doodad.getGrowingStage();
				if (stage !== undefined && description.harvest && description.harvest[stage]) {
					actionType = ActionType.Harvest;

				} else {
					actionType = ActionType.Gather;
				}

				actionArguments.push(getBestActionItem(context, ActionType.Gather, DamageType.Slashing));

				break;

			case ExecuteActionType.Terrain:
				actionType = terrainDescription.gather ? ActionType.Gather : ActionType.Dig;
				actionArguments.push(terrainDescription.gather ? getBestActionItem(context, ActionType.Gather, DamageType.Blunt) : getBestActionItem(context, ActionType.Dig));

				if (actionType === ActionType.Dig && hasCorpses(tile)) {
					return ObjectiveResult.Complete;
				}

				break;

			case ExecuteActionType.Corpse:
				const carveTool = getInventoryItemsWithUse(context, ActionType.Carve);

				if (carveTool.length === 0 ||
					!tile.corpses ||
					tile.corpses.length === 0 ||
					tile.creature !== undefined ||
					tile.npc !== undefined ||
					tile.events !== undefined ||
					game.isPlayerAtTile(tile)) {
					return ObjectiveResult.Complete;
				}

				actionType = ActionType.Carve;
				actionArguments.push(carveTool[0]);

				break;

			case ExecuteActionType.Generic:
				if (this.actionType === undefined) {
					this.log.error("Invalid action type");
					return ObjectiveResult.Impossible;
				}

				actionType = this.actionType;
				break;

			default:
				return ObjectiveResult.Complete;
		}

		const result = await this.executeActionForItem(context, this.itemTypes, actionType, ((context: Context, action: any) => {
			if (this.executor) {
				this.executor(context, action);

			} else {
				action.execute(context.player, ...actionArguments);
			}
		}) as any);

		// console.log("Result", ObjectiveResult[result]);
		if (this.type === ExecuteActionType.Generic) {
			// never return undefined for generic - that would make it retry this objective with the same arguments
			return result === ObjectiveResult.Complete ? ObjectiveResult.Complete : ObjectiveResult.Restart;
		}

		return result;
	}

	protected getBaseDifficulty(context: Context): number {
		return 1;
	}

	private async executeActionForItem<T extends ActionType>(
		context: Context,
		itemTypes: ItemType[],
		actionType: T,
		executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never) => void): Promise<ObjectiveResult> {
		let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, actionType, executor as any);
		if (matchingNewItem !== undefined) {
			this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id})`);
			context.setData(ContextDataType.LastAcquiredItem, matchingNewItem);
			context.addReservedItems(matchingNewItem);
			return ObjectiveResult.Complete;
		}

		const item = context.player.getTile().containedItems?.find(item => itemTypes.indexOf(item.type) !== -1);
		if (item) {
			matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, ActionType.MoveItem, ((context: Context, action: any) => {
				action.execute(context.player, item, context.player.inventory);
			}));

			if (matchingNewItem !== undefined) {
				this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}) (via MoveItem)`);
				context.setData(ContextDataType.LastAcquiredItem, matchingNewItem);
				context.addReservedItems(matchingNewItem);
				return ObjectiveResult.Complete;
			}
		}

		return ObjectiveResult.Pending;
	}

	private async executeActionCompareInventoryItems<T extends ActionType>(
		context: Context,
		itemTypes: ItemType[],
		actionType: T,
		executor: (context: Context, action: (typeof actionDescriptions)[T] extends IActionDescription<infer A, infer E, infer R> ? ActionExecutor<A, E, R> : never) => void) {
		const itemsBefore = context.player.inventory.containedItems.slice(0);

		await executeAction(context, actionType, executor as any);

		const newItems = context.player.inventory.containedItems.filter(item => itemsBefore.indexOf(item) === -1);

		return newItems.find(item => itemTypes.indexOf(item.type) !== -1);
	}
}
