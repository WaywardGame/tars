import doodadDescriptions from "game/doodad/Doodads";
import { ActionType } from "game/entity/action/IAction";
import { ItemType } from "game/item/IItem";
import Item from "game/item/Item";
import { ITileContainer, TerrainType } from "game/tile/ITerrain";
import TileHelpers from "utilities/game/TileHelpers";

import Context from "../../../Context";
import { ContextDataType } from "../../../IContext";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../IObjective";
import { gardenMaxTilesChecked } from "../../../ITars";
import Objective from "../../../Objective";
import { baseUtilities } from "../../../utilities/Base";
import AcquireItem from "../../acquire/item/AcquireItem";
import CopyContextData from "../../contextData/CopyContextData";
import SetContextData from "../../contextData/SetContextData";
import MoveToTarget from "../../core/MoveToTarget";

import UseItem from "./UseItem";

export default class PlantSeed extends Objective {

	private readonly plantTiles: TerrainType[];

	constructor(private readonly seed: Item) {
		super();

		const description = this.seed.description();
		if (!description || !description.onUse) {
			throw new Error("Invalid onUse for seed");
		}

		const plantType = description.onUse[ActionType.Plant];
		const plantDescription = doodadDescriptions[plantType!];
		if (!plantDescription) {
			throw new Error("Invalid plant description");
		}

		const allowedTiles = plantDescription.allowedTiles;
		if (!allowedTiles) {
			throw new Error("Invalid allowed tiles");
		}

		this.plantTiles = allowedTiles;
	}

	public getIdentifier(): string {
		return `PlantSeed:${this.seed}`;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
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
				this.plantTiles.includes(TileHelpers.getType(tile)) &&
				(tileContainer.containedItems === undefined || tileContainer.containedItems.length === 0);
		}, { maxTilesChecked: gardenMaxTilesChecked });
		if (emptyTilledTile !== undefined) {
			objectives.push(new MoveToTarget(emptyTilledTile, true));

		} else {
			const nearbyTillableTile = TileHelpers.findMatchingTile(baseUtilities.getBasePosition(context), (point, tile) =>
				this.plantTiles.includes(TileHelpers.getType(tile)) && baseUtilities.isOpenArea(context, point, tile), { maxTilesChecked: gardenMaxTilesChecked });
			if (nearbyTillableTile !== undefined) {
				objectives.push(new MoveToTarget(nearbyTillableTile, true));
				objectives.push(new CopyContextData(ContextDataType.Item1, ContextDataType.LastAcquiredItem));
				objectives.push(new UseItem(ActionType.Till));

			} else {
				return ObjectiveResult.Impossible;
			}
		}

		objectives.push(new UseItem(ActionType.Plant, this.seed));

		return objectives;
	}

}