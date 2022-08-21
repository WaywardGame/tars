import { ItemType, ItemTypeGroup } from "game/item/IItem";
import ItemManager from "game/item/ItemManager";
import { TerrainType } from "game/tile/ITerrain";
import Terrains from "game/tile/Terrains";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";

import type Context from "../../core/context/Context";
import { ITerrainResourceSearch } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AddDifficulty from "../core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromTerrainResource extends Objective {

	public readonly gatherObjectivePriority = 200;

	constructor(private readonly search: ITerrainResourceSearch[]) {
		super();
	}

	public getIdentifier(): string {
		return `GatherFromTerrainResource:${this.search.map(search => `${TerrainType[search.type]}:${ItemManager.isGroup(search.itemType) ? ItemTypeGroup[search.itemType] : ItemType[search.itemType]}`).join(",")}`;
	}

	public getStatus(): string | undefined {
		return "Gathering items from terrain";
	}

	public override canGroupTogether(): boolean {
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		const tool = context.inventory.shovel;

		for (const terrainSearch of this.search) {
			const terrainDescription = Terrains[terrainSearch.type];
			if (!terrainDescription) {
				continue;
			}

			const tileLocations = await context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);

			for (const tileLocation of tileLocations) {
				// todo: debug solar still blocking wateR?
				if (!context.utilities.tile.canGather(context, tileLocation.tile)) {
					continue;
				}

				let step = 0;

				const point = tileLocation.point;
				const tileData = context.island.getTileData(point.x, point.y, point.z);
				if (tileData && tileData.length > 0) {
					const tileDataStep = tileData[0].step;
					if (tileDataStep !== undefined) {
						step = tileDataStep;
					}
				}

				let difficulty = 0;
				let matches = 0;

				const resources = context.island.getTerrainItems(terrainSearch?.resource);
				if (resources) {
					const nextLootItems = resources.slice(step);
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
				}

				if (matches === 0) {
					if (step === 0) {
						this.log.error("GatherFromTerrain no matches", step, ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
					}

					continue;
				}

				if (!terrainDescription.gather && !tool) {
					difficulty += 500;
				}

				if (terrainSearch.extraDifficulty !== undefined) {
					difficulty += terrainSearch.extraDifficulty;
				}

				difficulty = Math.round(difficulty);

				objectivePipelines.push([
					new AddDifficulty(difficulty),
					new MoveToTarget(point, true),
					new ExecuteActionForItem(ExecuteActionType.Terrain, this.search.map(search => search.itemType))
						.passAcquireData(this)
						.setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, terrainSearch.itemType).getString()} from ${Translation.nameOf(Dictionary.Terrain, terrainSearch.type).getString()}`),
				]);
			}
		}

		return objectivePipelines;
	}

	protected override getBaseDifficulty(context: Context): number {
		return 10;
	}

}
