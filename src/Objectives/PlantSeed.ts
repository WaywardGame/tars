import { ActionType, ItemType, TerrainType } from "Enums";
import { IItem } from "item/IItem";
import { ITile, ITileContainer } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { gardenMaxTilesChecked, IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";
import UseItem from "./UseItem";

export default class PlantSeed extends Objective {

	constructor(private seed: IItem) {
		super();
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (inventory.hoe === undefined) {
			this.log.info("Acquire a stone hoe");
			return new AcquireItem(ItemType.StoneHoe);
		}

		const emptyTilledTile = await Helpers.findAndMoveToTarget((point: IVector3, tile: ITile) => {
			const tileContainer = tile as ITileContainer;
			return tile.doodad === undefined &&
				TileHelpers.isOpenTile(point, tile) &&
				TileHelpers.getType(tile) === TerrainType.Dirt &&
				TileHelpers.isTilled(tile) &&
				tile.corpses === undefined &&
				(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
		}, false, gardenMaxTilesChecked, Helpers.getBasePosition(base));
		if (emptyTilledTile === MoveResult.NoTarget) {
			const nearbyDirtTile = await Helpers.findAndMoveToTarget((point: IVector3, tile: ITile) =>
				TileHelpers.getType(tile) === TerrainType.Dirt && Helpers.isOpenArea(base, point, tile), false, gardenMaxTilesChecked, Helpers.getBasePosition(base));
			if (nearbyDirtTile === MoveResult.NoTarget) {
				this.log.info("No nearby dirt tile");
				return ObjectiveStatus.Complete;
			}

			if (nearbyDirtTile !== MoveResult.Complete) {
				return;
			}

			this.log.info("Till a tile");
			return new UseItem(inventory.hoe, ActionType.Till);

		} else if (emptyTilledTile === MoveResult.Complete) {
			this.log.info(`Plant ${ItemType[this.seed.type]}`);
			return new UseItem(this.seed, ActionType.Plant);
		}
	}

}
