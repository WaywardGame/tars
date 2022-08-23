import doodadDescriptions from "game/doodad/Doodads";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import { ITile, TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import { itemDescriptions } from "game/item/ItemDescriptions";
import Plant from "game/entity/action/actions/Plant";
import Till from "game/entity/action/actions/Till";

import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import MoveToTarget from "../../core/MoveToTarget";
import DigTile from "../tile/DigTile";
import UseItem from "./UseItem";
import ReserveItems from "../../core/ReserveItems";
import MoveItemIntoInventory from "./MoveItemIntoInventory";
import Lambda from "../../core/Lambda";
import ClearTile from "../tile/ClearTile";
import Item from "game/item/Item";
import AcquireInventoryItem from "../../acquire/item/AcquireInventoryItem";

export const gardenMaxTilesChecked = 1536;

export default class PlantSeed extends Objective {

	constructor(private readonly itemOrItemType: Item | ItemType, private readonly maxTilesChecked: number | undefined = gardenMaxTilesChecked) {
		super();
	}

	public getIdentifier(): string {
		return `PlantSeed:${typeof (this.itemOrItemType) === "number" ? ItemType[this.itemOrItemType] : this.itemOrItemType}`;
	}

	public getStatus(): string | undefined {
		return `Planting ${typeof (this.itemOrItemType) === "number" ? Translation.nameOf(Dictionary.Item, this.itemOrItemType).getString() : this.itemOrItemType.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const result = this.getTillObjectives(context);
		if (result === undefined) {
			return ObjectiveResult.Impossible;
		}

		const item = typeof (this.itemOrItemType) === "number" ? this.getAcquiredItem(context) : this.itemOrItemType;
		if (!item?.isValid()) {
			this.log.error("Invalid seed item");
			return ObjectiveResult.Restart;
		}

		return [
			new ReserveItems(item).keepInInventory(),
			new MoveItemIntoInventory(item),
			new AcquireInventoryItem("hoe"),
			...result,
			new UseItem(Plant, item),
		];
	}

	private getTillObjectives(context: Context): IObjective[] | undefined {
		const itemType = typeof (this.itemOrItemType) === "number" ? this.itemOrItemType : this.itemOrItemType.type;

		const allowedTiles = doodadDescriptions[itemDescriptions[itemType]?.onUse?.[ActionType.Plant]!]?.allowedTiles;
		if (!allowedTiles) {
			return undefined;
		}

		const allowedTilesSet = new Set(allowedTiles);

		const emptyTilledTile = TileHelpers.findMatchingTile(
			context.island,
			context.utilities.base.getBasePosition(context),
			(island, point, tile) => {
				return island.isTileEmpty(tile) &&
					TileHelpers.isOpenTile(island, point, tile) &&
					island.isTilled(point.x, point.y, point.z) &&
					allowedTiles.includes(TileHelpers.getType(tile));
			}, { maxTilesChecked: this.maxTilesChecked });
		if (emptyTilledTile !== undefined) {
			return [
				new MoveToTarget(emptyTilledTile, true),
				new ClearTile(emptyTilledTile),
			];
		}

		let tile: ITile | undefined;
		let point: IVector3 | undefined;

		const facingTile = context.human.getFacingTile();
		const facingPoint = context.human.getFacingPoint();
		if (context.utilities.tile.canTill(context, facingPoint, facingTile, context.inventory.hoe, allowedTilesSet)) {
			tile = facingTile;
			point = facingPoint;

		} else {
			const nearbyTillableTile = TileHelpers.findMatchingTiles(
				context.island,
				context.utilities.base.getBasePosition(context),
				(_, point, tile) => context.utilities.tile.canTill(context, point, tile, context.inventory.hoe, allowedTilesSet),
				{
					maxTilesChecked: gardenMaxTilesChecked,
					maxTiles: 1,
				}
			);

			if (nearbyTillableTile.length === 0) {
				return undefined;
			}

			const target = nearbyTillableTile[0];
			tile = target.tile;
			point = target.point;
		}

		let objectives: IObjective[] = [];

		if (TileHelpers.getType(tile) === TerrainType.Grass) {
			objectives.push(new DigTile(point, { digUntilTypeIsNot: TerrainType.Grass }));
		}

		objectives.push(
			new MoveToTarget(point, true),
			new UseItem(Till, "hoe"),
			new Lambda(async context => {
				const facingPoint = context.human.getFacingPoint();

				if (context.human.island.isTilled(facingPoint.x, facingPoint.y, facingPoint.z)) {
					return ObjectiveResult.Complete;
				}

				this.log.info("Not tilled yet");

				return ObjectiveResult.Restart;
			}).setStatus(this),
		);

		return objectives;
	}
}
