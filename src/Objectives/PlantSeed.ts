import { ActionType } from "action/IAction";
import { ItemType, TerrainType } from "Enums";
import { IItem } from "item/IItem";
import { ITile, ITileContainer } from "tile/ITerrain";
import { IVector3 } from "utilities/math/IVector";
import TileHelpers from "utilities/TileHelpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { gardenMaxTilesChecked, IBase, IInventoryItems } from "../ITars";
import Objective from "../Objective";
import { getBasePosition, isOpenArea } from "../Utilities/Base";
import { findAndMoveToFaceTarget, MoveResult } from "../Utilities/Movement";
import AcquireItem from "./AcquireItem";
import UseItem from "./UseItem";

export default class PlantSeed extends Objective {

	constructor(private readonly seed: IItem) {
		super();
	}

	public getHashCode(): string {
		return `PlantSeed:${this.seed.getName(false).getString()}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		if (inventory.hoe === undefined) {
			this.log.info("Acquire a stone hoe");
			return new AcquireItem(ItemType.StoneHoe);
		}

		const emptyTilledTile = await findAndMoveToFaceTarget((point: IVector3, tile: ITile) => {
			const tileContainer = tile as ITileContainer;
			return tile.doodad === undefined &&
				TileHelpers.isOpenTile(point, tile) &&
				TileHelpers.getType(tile) === TerrainType.Dirt &&
				TileHelpers.isTilled(tile) &&
				tile.corpses === undefined &&
				(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
		}, gardenMaxTilesChecked, getBasePosition(base));
		if (emptyTilledTile === MoveResult.NoTarget) {
			const nearbyDirtTile = await findAndMoveToFaceTarget((point: IVector3, tile: ITile) =>
				TileHelpers.getType(tile) === TerrainType.Dirt && isOpenArea(point, tile), gardenMaxTilesChecked, getBasePosition(base));
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
			this.log.info(`Plant ${this.seed.getName(false).getString()}`);
			return new UseItem(this.seed, ActionType.Plant);
		}
	}

}
