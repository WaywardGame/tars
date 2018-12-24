import { ActionType } from "action/IAction";
import { ItemType, DoodadType } from "Enums";
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
import doodadDescriptions from "doodad/Doodads";

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

		const description = this.seed.description();
		if (!description || !description.onUse) {
			return;
		}

		const plantType: DoodadType = description.onUse[ActionType.Plant];
		const plantDescription = doodadDescriptions[plantType];
		if (!plantDescription) {
			return;
		}

		const allowedTiles = plantDescription.allowedTiles;
		if (!allowedTiles) {
			return;
		}
		
		const emptyTilledTile = await findAndMoveToFaceTarget((point: IVector3, tile: ITile) => {
			const tileContainer = tile as ITileContainer;
			return tile.doodad === undefined &&
				tile.corpses === undefined &&
				TileHelpers.isOpenTile(point, tile) &&
				TileHelpers.isTilled(tile) &&
				allowedTiles.indexOf(TileHelpers.getType(tile)) !== -1 &&
				(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
		}, gardenMaxTilesChecked, getBasePosition(base));
		if (emptyTilledTile === MoveResult.NoTarget) {
			const nearbyTillableTile = await findAndMoveToFaceTarget((point: IVector3, tile: ITile) => allowedTiles.indexOf(TileHelpers.getType(tile)) !== -1 && isOpenArea(point, tile), gardenMaxTilesChecked, getBasePosition(base));
			if (nearbyTillableTile === MoveResult.NoTarget) {
				this.log.info("No nearby dirt tile");
				return ObjectiveStatus.Complete;
			}

			if (nearbyTillableTile !== MoveResult.Complete) {
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
