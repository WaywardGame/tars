import doodadDescriptions from "game/doodad/Doodads";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import type Item from "game/item/Item";
import type { ITileContainer } from "game/tile/ITerrain";
import { TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";
import terrainDescriptions from "game/tile/Terrains";

import type Context from "../../../core/context/Context";
import { ContextDataType } from "../../../core/context/IContext";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import Objective from "../../../core/objective/Objective";
import AcquireItem from "../../acquire/item/AcquireItem";
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

	public getStatus(): string | undefined {
		return `Planting ${this.seed?.getName()}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const seed = this.seed ?? this.getAcquiredItem(context);
		if (!seed) {
			this.log.error("Invalid seed item");
			return ObjectiveResult.Restart;
		}

		const allowedTiles = doodadDescriptions[seed.description()?.onUse?.[ActionType.Plant]!]?.allowedTiles;
		if (!allowedTiles) {
			return ObjectiveResult.Impossible;
		}

		const allowedTilesSet = new Set(allowedTiles);

		const objectives: IObjective[] = [];

		if (context.inventory.hoe) {
			objectives.push(new SetContextData(ContextDataType.Item1, context.inventory.hoe));

		} else {
			objectives.push(new AcquireItem(ItemType.StoneHoe).setContextDataKey(ContextDataType.Item1));
		}

		const emptyTilledTile = TileHelpers.findMatchingTile(
			context.island,
			context.utilities.base.getBasePosition(context),
			(island, point, tile) => {
				const tileContainer = tile as ITileContainer;
				return island.isTileEmpty(tile) &&
					TileHelpers.isOpenTile(island, point, tile) &&
					TileHelpers.isTilled(tile) &&
					allowedTiles.includes(TileHelpers.getType(tile)) &&
					(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
			}, { maxTilesChecked: gardenMaxTilesChecked });
		if (emptyTilledTile !== undefined) {
			objectives.push(new MoveToTarget(emptyTilledTile, true));

		} else {
			const nearbyTillableTile = TileHelpers.findMatchingTiles(
				context.island,
				context.utilities.base.getBasePosition(context),
				(_, point, tile) => {
					if (tile.creature || tile.npc) {
						return false;
					}

					const tileType = TileHelpers.getType(tile);
					if (tileType === TerrainType.Grass) {
						if (!context.utilities.tile.canDig(context, tile)) {
							return false;
						}

						// digging grass will reveal dirt
						if (!allowedTilesSet.has(TerrainType.Dirt)) {
							return false;
						}

					} else {
						if (!allowedTilesSet.has(tileType)) {
							return false;
						}

						const terrainDescription = terrainDescriptions[tileType];
						if (!terrainDescription?.tillable) {
							return false;
						}
					}

					return context.utilities.base.isOpenArea(context, point, tile);
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

			objectives.push(new UseItem(ActionType.Till).setContextDataKey(ContextDataType.Item1));

			// it's possible tilling failed. restart after tilling to recalculate
			objectives.push(new Restart());
		}

		objectives.push(new UseItem(ActionType.Plant, seed));

		return objectives;
	}

}
