import Doodads from "game/doodad/Doodads";
import { DoodadType, GrowingStage } from "game/doodad/IDoodad";
import Corpses from "game/entity/creature/corpse/Corpses";
import { CreatureType } from "game/entity/creature/ICreature";
import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/Items";
import { TerrainType } from "game/tile/ITerrain";
import TerrainResources from "game/tile/TerrainResources";
import terrainDescriptions from "game/tile/Terrains";
import { Dictionary } from "language/Dictionaries";
import Translation from "language/Translation";
import Enums from "utilities/enum/Enums";
import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import { CreatureSearch, DoodadSearchMap, ITerrainSearch } from "../../../ITars";
import GatherFromChest from "../../Gather/GatherFromChest";
import GatherFromCorpse from "../../Gather/GatherFromCorpse";
import GatherFromCreature from "../../Gather/GatherFromCreature";
import GatherFromDoodad from "../../Gather/GatherFromDoodad";
import GatherFromGround from "../../Gather/GatherFromGround";
import GatherFromTerrain from "../../Gather/GatherFromTerrain";
import AcquireBase from "./AcquireBase";
import AcquireItemFromDismantle from "./AcquireItemFromDismantle";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";



export default class AcquireItem extends AcquireBase {

	private static readonly terrainSearchCache: Map<ItemType, ITerrainSearch[]> = new Map();
	private static readonly doodadSearchCache: Map<ItemType, DoodadSearchMap> = new Map();
	private static readonly creatureSearchCache: Map<ItemType, CreatureSearch> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, ItemType[]> = new Map();

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItem:${ItemType[this.itemType]}`;
	}

	public getStatus(): string {
		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		this.log.info(`Acquiring ${ItemType[this.itemType]}...`);

		const itemDescription = itemDescriptions[this.itemType];

		const objectivePipelines: IObjective[][] = [
			[new GatherFromGround(this.itemType).passContextDataKey(this)],
			[new GatherFromChest(this.itemType).passContextDataKey(this)],
		];

		const terrainSearch = this.getTerrainSearch();
		if (terrainSearch.length > 0) {
			objectivePipelines.push([new GatherFromTerrain(terrainSearch).passContextDataKey(this)]);
		}

		const doodadSearch = this.getDoodadSearch();
		if (doodadSearch.size > 0) {
			objectivePipelines.push([new GatherFromDoodad(this.itemType, doodadSearch).passContextDataKey(this)]);
		}

		const creatureSearch: CreatureSearch = this.getCreatureSearch();
		if (creatureSearch.map.size > 0) {
			objectivePipelines.push([new GatherFromCorpse(creatureSearch).passContextDataKey(this)]);
			objectivePipelines.push([new GatherFromCreature(creatureSearch).passContextDataKey(this)]);
		}

		const dismantleSearch: ItemType[] = this.getDismantleSearch();
		if (dismantleSearch.length > 0) {
			objectivePipelines.push([new AcquireItemFromDismantle(this.itemType, dismantleSearch).passContextDataKey(this)]);
		}

		if (itemDescription && itemDescription.recipe) {
			objectivePipelines.push([new AcquireItemWithRecipe(this.itemType, itemDescription.recipe).passContextDataKey(this)]);
		}

		return objectivePipelines;
	}

	private getTerrainSearch(): ITerrainSearch[] {
		let search = AcquireItem.terrainSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			// todo: figure out a better way to handle this
			if (this.itemType !== ItemType.PlantRoots) {
				const resolvedTypes: Map<TerrainType, ITerrainSearch[]> = new Map();

				const unresolvedTypes: TerrainType[] = Array.from(Enums.values(TerrainType));

				while (unresolvedTypes.length > 0) {
					const terrainType = unresolvedTypes.shift()!;

					const terrainDescription = terrainDescriptions[terrainType];
					if (!terrainDescription) {
						continue;
					}

					const leftOvers = terrainDescription.leftOvers;
					if (leftOvers !== undefined) {
						for (const leftOver of leftOvers) {
							const leftOverType = leftOver.terrainType;
							const leftOverSearch = resolvedTypes.get(leftOverType);
							if (leftOverSearch === undefined) {
								// we have not resolved the search for the left over type yet
								// keep this as unresolved and try again later
								unresolvedTypes.push(leftOverType);
								continue;
							}
						}
					}

					let terrainSearches = resolvedTypes.get(terrainType);
					if (!terrainSearches) {
						terrainSearches = [];
						resolvedTypes.set(terrainType, terrainSearches);
					}

					const resource = TerrainResources[terrainType];
					if (resource && (resource.defaultItem === this.itemType || resource.items.some(ri => ri.type === this.itemType))) {
						const terrainSearch: ITerrainSearch = {
							type: terrainType,
							itemType: this.itemType,
							resource: resource,
						};

						search.push(terrainSearch);
						terrainSearches.push(terrainSearch);
					}

					if (leftOvers) {
						for (const leftOver of leftOvers) {
							const terrainSearches = resolvedTypes.get(leftOver.terrainType);
							if (terrainSearches) {
								for (const terrainSearch of terrainSearches) {
									search.push({
										type: terrainType,
										itemType: this.itemType,
										resource: terrainSearch.resource,
										extraDifficulty: 5, // random number. todo: use this
									});
								}
							}
						}
					}
				}
			}

			AcquireItem.terrainSearchCache.set(this.itemType, search);
		}

		return search;
	}

	private getDoodadSearch(): DoodadSearchMap {
		let resolvedTypes = AcquireItem.doodadSearchCache.get(this.itemType);
		if (resolvedTypes === undefined) {
			resolvedTypes = new Map();

			const growingStages = Enums.values(GrowingStage);

			const unresolvedTypes: DoodadType[] = Array.from(Enums.values(DoodadType));

			while (unresolvedTypes.length > 0) {
				const doodadType = unresolvedTypes.shift()!;

				const doodadDescription = Doodads[doodadType];
				if (!doodadDescription) {
					continue;
				}

				let leftOverSearch: Map<GrowingStage, number> | undefined;

				const leftOver = doodadDescription.leftOver;
				if (leftOver !== undefined) {
					leftOverSearch = resolvedTypes.get(leftOver);
					if (leftOverSearch === undefined) {
						// we have not resolved the BaseItemSearch's for the left over type yet
						// keep this as unresolved and try again later
						unresolvedTypes.push(doodadType);
						continue;
					}

					// todo: add
				}

				const searchMap: Map<GrowingStage, number> = new Map();

				resolvedTypes.set(doodadType, searchMap);

				if (doodadDescription.gather && doodadType !== DoodadType.AppleTree) {
					for (const growingStage of growingStages) {
						const resourceItems = doodadDescription.gather[growingStage];
						if (!resourceItems) {
							continue;
						}

						if ((doodadDescription.isTall && growingStage >= GrowingStage.Budding) || growingStage >= GrowingStage.Ripening) {
							for (const resourceItem of resourceItems) {
								if (resourceItem.type !== this.itemType) {
									continue;
								}

								searchMap.set(growingStage, 0);

								// add the same item to a earlier growing stages but with extra difficulty
								for (const growingStage2 of growingStages) {
									if (growingStage2 >= GrowingStage.Budding) {
										const growingStageDiff = growingStage - growingStage2;
										if (growingStageDiff > 0) {
											const existingDifficulty = searchMap.get(growingStage2);
											const difficulty = growingStageDiff * 3;
											if (existingDifficulty === undefined || existingDifficulty > difficulty) {
												searchMap.set(growingStage2, growingStageDiff * 3);
											}
										}
									}
								}
							}
						}
					}
				}

				if (doodadDescription.harvest) {
					for (const key of Object.keys(doodadDescription.harvest)) {
						const growingStage = parseInt(key, 10);
						const resourceItems = doodadDescription.harvest[growingStage];
						if (!resourceItems) {
							continue;
						}

						if (searchMap.has(growingStage)) {
							continue;
						}

						for (const resourceItem of resourceItems) {
							if (resourceItem.type !== this.itemType) {
								continue;
							}

							searchMap.set(growingStage, 0);
							break;
						}
					}
				}
			}

			// cleanup empty search maps
			for (const [resolvedDoodadType, resolvedSearchMap] of Array.from(resolvedTypes)) {
				if (resolvedSearchMap.size === 0) {
					resolvedTypes.delete(resolvedDoodadType);
				}
			}

			AcquireItem.doodadSearchCache.set(this.itemType, resolvedTypes);
		}

		return resolvedTypes;
	}

	private getCreatureSearch(): CreatureSearch {
		let search = AcquireItem.creatureSearchCache.get(this.itemType);
		if (search === undefined) {
			const map = new Map();

			for (const creatureType of Enums.values(CreatureType)) {
				if (creatureType !== CreatureType.Shark) {
					const corpseDescription = Corpses[creatureType];
					if (corpseDescription && corpseDescription.resource) {
						for (const resource of corpseDescription.resource) {
							if (resource.item === this.itemType) {
								let itemTypes = map.get(creatureType);
								if (!itemTypes) {
									itemTypes = [];
									map.set(creatureType, itemTypes);
								}

								itemTypes.push(this.itemType);
							}
						}
					}
				}
			}

			search = {
				identifier: ItemType[this.itemType],
				map: map,
			};

			AcquireItem.creatureSearchCache.set(this.itemType, search);
		}

		return search;
	}

	private getDismantleSearch(): ItemType[] {
		let search = AcquireItem.dismantleSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			for (const it of Enums.values(ItemType)) {
				const description = itemDescriptions[it];
				if (description && description.dismantle) {
					for (const di of description.dismantle.items) {
						if (di.type === this.itemType) {
							search.push(it);
							break;
						}
					}
				}
			}

			AcquireItem.dismantleSearchCache.set(this.itemType, search);
		}

		return search;
	}

}
