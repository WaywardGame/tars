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

import { TerrainType } from "game/tile/ITerrain";
import { ItemTypeGroup, ItemType } from "game/item/IItem";
import ItemManager from "game/item/ItemManager";
import { terrainDescriptions } from "game/tile/Terrains";
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
			const terrainDescription = terrainDescriptions[terrainSearch.type];
			if (!terrainDescription) {
				continue;
			}

			const tileLocations = context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);

			for (const { tile } of tileLocations) {
				if (tile.creature || tile.npc || tile.doodad || tile.isPlayerOnTile()) {
					continue;
				}

				objectivePipelines.push([
					new MoveToTarget(tile, true),
					new PickUpAllTileItems(tile),
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
