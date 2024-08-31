import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import ItemManager from "@wayward/game/game/item/ItemManager";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import { terrainDescriptions } from "@wayward/game/game/tile/Terrains";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";

import type Context from "../../core/context/Context";
import { ITerrainResourceSearch, ITileLocation } from "../../core/ITars";
import type { IObjective, ObjectiveExecutionResult } from "../../core/objective/IObjective";
import Objective from "../../core/objective/Objective";
import AddDifficulty from "../core/AddDifficulty";
import ExecuteActionForItem, { ExecuteActionType } from "../core/ExecuteActionForItem";
import MoveToTarget from "../core/MoveToTarget";

export default class GatherFromTerrainResource extends Objective {

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

	public override isDynamic(): boolean {
		// marked as dynamic because the plan is optimized before execution.
		// that means this objective could end up regrouped.
		// the specific objective in the tree might be aiming to gather from some far away place.
		// running it dynamically will end up having it grab from the nearest spot
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		const objectivePipelines: IObjective[][] = [];

		for (const terrainSearch of this.search) {
			const tileLocations = context.utilities.tile.getNearestTileLocation(context, terrainSearch.type);

			for (const tileLocation of tileLocations) {
				this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation);
			}

			if (objectivePipelines.length === 0 && tileLocations.length === 5) {
				// we have a maximum of 5 nearest tile locations but no pipelines
				// we should still "try" to gather just to get rid of those and clear up a spot on the list
				for (const tileLocation of tileLocations) {
					this.processTerrainLocation(context, objectivePipelines, terrainSearch, tileLocation, true);
				}
			}
		}

		return objectivePipelines;
	}

	protected override getBaseDifficulty(context: Context): number {
		return 10;
	}

	private processTerrainLocation(context: Context, objectivePipelines: IObjective[][], terrainSearch: ITerrainResourceSearch, tileLocation: ITileLocation, skipSmartCheck?: boolean): void {
		const terrainDescription = terrainDescriptions[terrainSearch.type];
		if (!terrainDescription) {
			return;
		}

		// todo: debug solar still blocking water?
		if (!context.utilities.tile.canGather(context, tileLocation.tile)) {
			return;
		}

		let step = 0;

		const tile = tileLocation.tile;

		const tileData = tile.getTileData();
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
			if (skipSmartCheck) {
				// the item is not going to magically appear
				difficulty += 50000;

			} else {
				if (step === 0) {
					this.log.error("GatherFromTerrain no matches", step, ItemType[terrainSearch.itemType], difficulty, JSON.stringify(terrainSearch));
				}

				return;
			}
		}

		if (!terrainDescription.gather && !context.inventory.shovel) {
			difficulty += 500;
		}

		if (terrainSearch.extraDifficulty !== undefined) {
			difficulty += terrainSearch.extraDifficulty;
		}

		difficulty = Math.round(difficulty);

		objectivePipelines.push([
			new AddDifficulty(difficulty),
			new MoveToTarget(tile, true),
			new ExecuteActionForItem(ExecuteActionType.Terrain, this.search.map(search => search.itemType), { expectedTerrainType: terrainSearch.type })
				.passAcquireData(this)
				.setStatus(() => `Gathering ${Translation.nameOf(Dictionary.Item, terrainSearch.itemType).getString()} from ${Translation.nameOf(Dictionary.Terrain, terrainSearch.type).getString()}`),
		]);
	}

}
