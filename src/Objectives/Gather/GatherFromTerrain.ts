import { ActionType } from "game/entity/action/IAction";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";

import Context from "../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../IObjective";
import { ITerrainSearch } from "../../ITars";
import Objective from "../../Objective";
import { getBestActionItem } from "../../utilities/Item";
import { canGather, getNearestTileLocation } from "../../utilities/Tile";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromTerrain extends Objective {

	constructor(private readonly search: ITerrainSearch[]) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromTerrain:${this.search.map(search => `${TerrainType[search.type]}:${itemManager.isGroup(search.itemType) ? ItemTypeGroup[search.itemType] : ItemType[search.itemType]}`).join(",")}`;
	}

	public canGroupTogether(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const hasDigTool = getBestActionItem(context, ActionType.Dig) !== undefined;

		for (const terrainSearch of this.search) {
			const terrainDescription = Terrains[terrainSearch.type];
			if (!terrainDescription) {
				continue;
			}

			const tileLocations = await getNearestTileLocation(context, terrainSearch.type);

			for (const tileLocation of tileLocations) {
				if (!canGather(tileLocation.tile)) {
					continue;
				}

				let step = 0;

				const point = tileLocation.point;
				const tileData = game.getTileData(point.x, point.y, point.z);
				if (tileData && tileData.length > 0) {
					const tileDataStep = tileData[0].step;
					if (tileDataStep !== undefined) {
						step = tileDataStep;
					}
				}

				let difficulty = 0;
				let matches = 0;

				const nextLootItems = terrainSearch.resource.items.slice(step);
				for (let i = 0; i < nextLootItems.length; i++) {
					const loot = nextLootItems[i];

					let chanceForHit = 0;

					if (loot.type === terrainSearch.itemType) {
						matches++;

						if (loot.chance === undefined) {
							// we are guarenteed to get the item if we keep hitting this
							difficulty = i * 2;
							break;
						}

						chanceForHit = loot.chance / 100;

						difficulty += 60 * (1 - chanceForHit);

					} else {
						difficulty += 5;
					}
				}

				if (matches === 0) {
					if (step === 0) {
						// tslint:disable-next-line: no-console
						console.error("GatherFromTerrain no matches", step, ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
					}

					continue;
				}

				if (!terrainDescription.gather && !hasDigTool) {
					difficulty += 500;
				}

				difficulty = Math.round(difficulty);

				const objectives: IObjective[] = [];

				objectives.push(new MoveToTarget(point, true).addDifficulty(difficulty));

				objectives.push(new ExecuteActionForItem(ExecuteActionType.Terrain, this.search.map(search => search.itemType)).passContextDataKey(this));

				objectivePipelines.push(objectives);
			}
		}

		return objectivePipelines;
	}

	protected getBaseDifficulty(context: Context): number {
		return 10;
	}

}
