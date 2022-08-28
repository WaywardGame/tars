import { TerrainType } from "game/tile/ITerrain";
import { ItemTypeGroup, ItemType } from "game/item/IItem";
import ItemManager from "game/item/ItemManager";
import Terrains from "game/tile/Terrains";
import GatherLiquid from "game/entity/action/actions/GatherLiquid";

import type Context from "../../core/context/Context";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import MoveToTarget from "../core/MoveToTarget";
import PickUpAllTileItems from "../other/tile/PickUpAllTileItems";
import { ITerrainWaterSearch } from "../../core/ITars";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import { ActionArguments } from "game/entity/action/IAction";

export default class GatherFromTerrainWater extends Objective {

	constructor(private readonly search: ITerrainWaterSearch[], private readonly waterContainerContextDataKey: string) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromTerrainWater:${this.search.map(search => `${TerrainType[search.type]}:${ItemManager.isGroup(search.itemType) ? ItemTypeGroup[search.itemType] : ItemType[search.itemType]}`).join(",")}`;
	}

	public getStatus(): string | undefined {
		return "Gathering water from terrain";
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const terrainSearch of this.search) {
			const terrainDescription = Terrains[terrainSearch.type];
			if (!terrainDescription) {
				continue;
			}

			const tileLocations = await context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);

			for (const { tile, point } of tileLocations) {
				if (tile.creature || tile.npc || tile.doodad || context.island.isPlayerAtTile(tile)) {
					continue;
				}

				objectivePipelines.push([
					new MoveToTarget(point, true),
					new PickUpAllTileItems(point),
					new ExecuteActionForItem(
						ExecuteActionType.Generic,
						[terrainSearch.itemType],
						{
							genericAction: {
								action: GatherLiquid,
								args: (context) => {
									const item = context.getData(this.waterContainerContextDataKey);
									if (!item?.isValid()) {
										this.log.warn(`Invalid water container ${item}`, this.waterContainerContextDataKey);
										return ObjectiveResult.Restart;
									}

									return [item] as ActionArguments<typeof GatherLiquid>;
								},
							},
						})
						.passAcquireData(this),
				]);
			}
		}

		return objectivePipelines;
	}
}
