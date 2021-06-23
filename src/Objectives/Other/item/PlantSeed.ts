import doodadDescriptions from "game/doodad/Doodads";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ITileContainer, TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import terrainDescriptions from "game/tile/Terrains";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import Objective from "../../../Objective";
import { baseUtilities } from "../../../utilities/Base";
import { tileUtilities } from "../../../utilities/Tile";
import AcquireItem from "../../acquire/item/AcquireItem";
import CopyContextData from "../../contextData/CopyContextData";
import SetContextData from "../../contextData/SetContextData";
import MoveToTarget from "../../core/MoveToTarget";
import Restart from "../../core/Restart";
import DigTile from "../tile/DigTile";

import UseItem from "./UseItem";

export const gardenMaxTilesChecked = 1536;

export default class PlantSeed extends Objective {

	constructor(private readonly seed?: Item) {
		super();
	}

	public getIdentifier(): string {
		return `PlantSeed:${this.seed}`;
	}

	public getStatus(): string {
		return `Planting ${this.seed?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const seed = this.seed ?? context.getData(ContextDataType.LastAcquiredItem);
		if (!seed) {
			return ObjectiveResult.Restart;
		}

		const allowedTiles = doodadDescriptions[seed.description()?.onUse?.[ActionType.Plant]!]?.allowedTiles;
		if (!allowedTiles) {
			return ObjectiveResult.Impossible;
		}

		const allowedTilesSet = new Set(allowedTiles);

		const objectives: IObjective[] = [];

		if (context.inventory.hoe === undefined) {
			objectives.push(new AcquireItem(ItemType.StoneHoe));
			objectives.push(new CopyContextData(ContextDataType.LastAcquiredItem, ContextDataType.Item1));

		} else {
			objectives.push(new SetContextData(ContextDataType.Item1, context.inventory.hoe));
		}

		const emptyTilledTile = TileHelpers.findMatchingTile(baseUtilities.getBasePosition(context), (point, tile) => {
			const tileContainer = tile as ITileContainer;
			return game.isTileEmpty(tile) &&
				TileHelpers.isOpenTile(point, tile) &&
				TileHelpers.isTilled(tile) &&
				allowedTiles.includes(TileHelpers.getType(tile)) &&
				(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
		}, { maxTilesChecked: gardenMaxTilesChecked });
		if (emptyTilledTile !== undefined) {
			objectives.push(new MoveToTarget(emptyTilledTile, true));

		} else {
			const nearbyTillableTile = TileHelpers.findMatchingTiles(
				baseUtilities.getBasePosition(context),
				(point, tile) => {
					const tileType = TileHelpers.getType(tile);
					if (tileType === TerrainType.Grass && !tileUtilities.canDig(tile)) {
						return false;
					}

					if (!allowedTilesSet.has(tileType)) {
						return false;
					}

					const terrainDescription = terrainDescriptions[tileType];
					if (!terrainDescription?.tillable) {
						return false;
					}

					return baseUtilities.isOpenArea(context, point, tile);
				},
				{
					maxTilesChecked: gardenMaxTilesChecked,
					maxTiles: 1,
				}
			);

			if (nearbyTillableTile.length === 0) {
				return ObjectiveResult.Impossible;
			}

			const { tile, point } = nearbyTillableTile[0];

			if (TileHelpers.getType(tile) === TerrainType.Grass) {
				objectives.push(new DigTile(point, { digUntilTypeIsNot: TerrainType.Grass }));
			}

			objectives.push(new MoveToTarget(point, true));
			objectives.push(new CopyContextData(ContextDataType.Item1, ContextDataType.LastAcquiredItem));
			objectives.push(new UseItem(ActionType.Till));

			// it's possible tilling failed. restart after tilling to recalculate
			objectives.push(new Restart());
		}

		objectives.push(new UseItem(ActionType.Plant, seed));

		return objectives;
	}

}
