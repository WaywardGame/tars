/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */

import Stream from "@wayward/goodstream/Stream";
import type { AnyActionDescription } from "@wayward/game/game/entity/action/IAction";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import { ItemType } from "@wayward/game/game/item/IItem";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import Dictionary from "@wayward/game/language/Dictionary";
import { ListEnder } from "@wayward/game/language/ITranslation";
import Translation from "@wayward/game/language/Translation";
import Item from "@wayward/game/game/item/Item";
// import MoveItem from "@wayward/game/game/entity/action/actions/MoveItem";
import Harvest from "@wayward/game/game/entity/action/actions/Harvest";
import Butcher from "@wayward/game/game/entity/action/actions/Butcher";
import Chop from "@wayward/game/game/entity/action/actions/Chop";
import Dig from "@wayward/game/game/entity/action/actions/Dig";
import Mine from "@wayward/game/game/entity/action/actions/Mine";

import type Context from "../../core/context/Context";
import type { ObjectiveExecutionResult } from "../../core/objective/IObjective";
import { ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import { ReserveType } from "../../core/ITars";
import { GetActionArguments } from "../../utilities/ActionUtilities";
import Message from "@wayward/game/language/dictionary/Message";

export enum ExecuteActionType {
	Generic,
	Doodad,
	Terrain,
	Corpse,
}

export interface IExecuteActioGenericAction<T extends AnyActionDescription> {
	action: T;
	args: GetActionArguments<T>;
	expectedMessages?: Set<Message>;
}

export interface IExecuteActionForItemOptions<T extends AnyActionDescription> {
	expectedTerrainType?: TerrainType;

	onlyAllowHarvesting: boolean;
	onlyGatherWithHands: boolean;

	moveAllMatchingItems: boolean;

	genericAction: IExecuteActioGenericAction<T>;

	preRetry: (context: Context) => ObjectiveResult | undefined,
}

export default class ExecuteActionForItem<T extends AnyActionDescription> extends Objective {

	protected override readonly includeUniqueIdentifierInHashCode: boolean = true;

	private readonly itemTypes: Set<ItemType>;

	constructor(
		private readonly type: ExecuteActionType,
		itemTypes: Set<ItemType> | ItemType[],
		private readonly options?: Partial<IExecuteActionForItemOptions<T>>) {
		super();

		this.itemTypes = !(itemTypes instanceof Set) ? new Set(itemTypes) : itemTypes;
	}

	public getIdentifier(): string {
		return `ExecuteActionForItem:${ExecuteActionType[this.type]}${this.options?.genericAction !== undefined ? `:${ActionType[this.options.genericAction.action.type!]}` : ""}`;
	}

	public getStatus(): string | undefined {
		const translation = Stream.values(Array.from(this.itemTypes).map(itemType => Translation.nameOf(Dictionary.Item, itemType)))
			.collect(Translation.formatList, ListEnder.Or);

		return `Acquiring ${translation.getString()}`;
	}

	public override isDynamic(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		// ! this must be here !
		// example: AcquireItemWithRecipe -> IgniteItem 
		// it should set LastAcquiredItem to undefined, then IgnoreItem will return .Restart
		// without this, LastAcquiredItem might be some other item before the AcquireItemWithRecipe craft, which would break Ignite
		context.setData(this.contextDataKey, undefined);

		if (context.calculatingDifficulty) {
			return 0;
		}

		const tile = context.human.facingTile;
		const tileType = tile.type;

		const terrainDescription = tile.description;
		if (!terrainDescription) {
			return ObjectiveResult.Impossible;
		}

		let result: ObjectiveResult;

		switch (this.type) {
			case ExecuteActionType.Doodad: {
				const doodad = tile.doodad;
				if (!doodad) {
					return ObjectiveResult.Restart;
				}

				const description = doodad.description;
				if (!description) {
					return ObjectiveResult.Restart;
				}

				if (!context.utilities.tile.canGather(context, tile, true)) {
					return ObjectiveResult.Restart;
				}

				const action = doodad.canHarvest() ? Harvest : doodad.isGatherable() ? Chop : undefined;

				if (!action || (this.options?.onlyAllowHarvesting && action !== Harvest)) {
					return ObjectiveResult.Restart;
				}

				result = await this.executeActionForItem(context, this.itemTypes, {
					action,
					args: [this.options?.onlyGatherWithHands ? undefined : context.utilities.item.getBestToolForDoodadGather(context, doodad)]
				});

				break;
			}

			case ExecuteActionType.Terrain:
				if (this.options?.expectedTerrainType !== undefined && this.options.expectedTerrainType !== tileType) {
					// tile type changed, give up
					this.log.debug(`Terrain type changed from ${TerrainType[this.options.expectedTerrainType]} to ${TerrainType[tileType]}`);
					return ObjectiveResult.Restart;
				}

				const action = terrainDescription.gather ? Mine : Dig;

				if (action === Dig && !context.utilities.tile.canDig(context, tile)) {
					return ObjectiveResult.Restart;
				}

				result = await this.executeActionForItem(context, this.itemTypes, {
					action,
					args: [context.utilities.item.getBestToolForTerrainGather(context, tileType)]
				});

				break;

			case ExecuteActionType.Corpse:
				const tool = context.inventory.butcher;
				if (tool === undefined || !context.utilities.tile.canButcherCorpse(context, tile, tool)) {
					return ObjectiveResult.Restart;
				}

				result = await this.executeActionForItem(context, this.itemTypes, { action: Butcher, args: [tool] });

				break;

			case ExecuteActionType.Generic:
				if (this.options?.genericAction === undefined) {
					this.log.error("Invalid action");
					return ObjectiveResult.Impossible;
				}

				result = await this.executeActionForItem(context, this.itemTypes, this.options.genericAction);

				break;

			default:
				return ObjectiveResult.Complete;
		}

		return result;
	}

	protected override getBaseDifficulty(context: Context): number {
		return 1;
	}

	private async executeActionForItem<T extends AnyActionDescription>(context: Context, itemTypes: Set<ItemType>, action: IExecuteActioGenericAction<T>): Promise<ObjectiveResult> {
		let matchingNewItem = await this.executeActionCompareInventoryItems(context, itemTypes, action);
		if (typeof (matchingNewItem) === "number") {
			return matchingNewItem;
		}

		if (matchingNewItem !== undefined) {
			this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}, data key: ${this.contextDataKey})`);

			if (this.reserveType === ReserveType.Soft) {
				context.addSoftReservedItems(matchingNewItem);

			} else {
				context.addHardReservedItems(matchingNewItem);
			}

			context.setData(this.contextDataKey, matchingNewItem);

			return ObjectiveResult.Complete;
		}

		const matchingTileItems = context.human.tile.containedItems?.filter(item => itemTypes.has(item.type));
		if (matchingTileItems !== undefined && matchingTileItems.length > 0) {
			const matchingNewItems: Item[] = [];

			// for (let i = 0; i < (this.options?.moveAllMatchingItems ? matchingTileItems.length : 1); i++) {
			// 	const itemToMove = matchingTileItems[i];
			// 	const targetContainer = context.utilities.item.getMoveItemToInventoryTarget(context, itemToMove);

			// 	const matchingItem = await this.executeActionCompareInventoryItems(context, itemTypes, { action: MoveItem, args: [itemToMove, targetContainer] });
			// 	if (typeof (matchingItem) === "number") {
			// 		this.log.warn("Issue moving items", ObjectiveResult[matchingItem]);
			// 		return matchingItem;
			// 	}

			// 	if (matchingItem !== undefined) {
			// 		matchingNewItems.push(matchingItem);
			// 	}
			// }

			if (matchingNewItems.length > 0) {
				const matchingNewItem = matchingNewItems[0];

				this.log.info(`Acquired matching item ${ItemType[matchingNewItem.type]} (id: ${matchingNewItem.id}, data key: ${this.contextDataKey}) (via MoveItem)`);

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

		return this.options?.preRetry?.(context) ?? ObjectiveResult.Pending;
	}

	private async executeActionCompareInventoryItems<T extends AnyActionDescription>(context: Context, itemTypes: Set<ItemType>, action: IExecuteActioGenericAction<T>): Promise<ObjectiveResult | Item | undefined> {
		// map item ids to types. some items might change types due to an action
		const itemsBefore: Map<number, ItemType> = new Map(context.utilities.item.getItemsInInventory(context).map(item => ([item.id, item.type])));

		const result = await context.utilities.action.executeAction(context, action.action, action.args, action.expectedMessages);
		if (result !== ObjectiveResult.Complete) {
			return result;
		}

		const newOrChangedItems = context.utilities.item.getItemsInInventory(context).filter(item => {
			const beforeItemType = itemsBefore.get(item.id);
			return beforeItemType === undefined || beforeItemType !== item.type;
		});

		return newOrChangedItems.find(item => itemTypes.has(item.type));
	}
}
