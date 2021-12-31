import Doodads from "game/doodad/Doodads";
import { DoodadType, GrowingStage } from "game/doodad/IDoodad";
import Corpses from "game/entity/creature/corpse/Corpses";
import { CreatureType } from "game/entity/creature/ICreature";
import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/Items";
import { TerrainType } from "game/tile/ITerrain";
import TerrainResources from "game/tile/TerrainResources";
import terrainDescriptions from "game/tile/Terrains";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Enums from "utilities/enum/Enums";
import Context from "../../../Context";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import { CreatureSearch, DoodadSearchMap, ITerrainSearch } from "../../../ITars";
import { itemUtilities } from "../../../utilities/Item";
import UseProvidedItem from "../../core/UseProvidedItem";
import GatherFromChest from "../../gather/GatherFromChest";
import GatherFromCorpse from "../../gather/GatherFromCorpse";
import GatherFromCreature from "../../gather/GatherFromCreature";
import GatherFromDoodad from "../../gather/GatherFromDoodad";
import GatherFromGround from "../../gather/GatherFromGround";
import GatherFromTerrain from "../../gather/GatherFromTerrain";
import AcquireBase, { IAcquireItemOptions } from "./AcquireBase";
import AcquireItemFromIgnite from "./AcquireItemAndIgnite";
import AcquireItemFromDisassemble from "./AcquireItemFromDisassemble";
import AcquireItemFromDismantle from "./AcquireItemFromDismantle";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";

export default class AcquireItem extends AcquireBase {

	private static readonly terrainSearchCache: Map<ItemType, ITerrainSearch[]> = new Map();
	private static readonly doodadSearchCache: Map<ItemType, DoodadSearchMap> = new Map();
	private static readonly creatureSearchCache: Map<ItemType, CreatureSearch> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, ItemType[]> = new Map();

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IAcquireItemOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItem:${ItemType[this.itemType]}`;
	}

	public getStatus(): string | undefined {
		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
	}

	public override canIncludeContextHashCode(): boolean {
		return true;
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		// we care about the context's reserved items
		return true;
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		this.log.info(`Acquiring ${ItemType[this.itemType]}...`);

		const itemDescription = itemDescriptions[this.itemType];

		const objectivePipelines: IObjective[][] = [
			[new GatherFromGround(this.itemType, this.options).passAcquireData(this)],
			[new GatherFromChest(this.itemType, this.options).passAcquireData(this)],
			[new UseProvidedItem(this.itemType).passAcquireData(this)],
		];

		const terrainSearch = this.getTerrainSearch();
		if (terrainSearch.length > 0) {
			objectivePipelines.push([new GatherFromTerrain(terrainSearch).passAcquireData(this)]);
		}

		if (!this.options.disableCreatureSearch) {
			const doodadSearch = this.getDoodadSearch();
			if (doodadSearch.size > 0) {
				objectivePipelines.push([new GatherFromDoodad(this.itemType, doodadSearch).passAcquireData(this)]);
			}
		}

		if (!this.options.disableCreatureSearch) {
			const creatureSearch: CreatureSearch = this.getCreatureSearch();
			if (creatureSearch.map.size > 0) {
				objectivePipelines.push([new GatherFromCorpse(creatureSearch).passAcquireData(this)]);
				objectivePipelines.push([new GatherFromCreature(creatureSearch).passAcquireData(this)]);
			}
		}

		const dismantleSearch: ItemType[] = this.getDismantleSearch();
		if (dismantleSearch.length > 0) {
			objectivePipelines.push([new AcquireItemFromDismantle(this.itemType, dismantleSearch).passAcquireData(this)]);
		}

		const disassembleSearch = itemUtilities.getDisassembleSearch(context, this.itemType);
		if (disassembleSearch.length > 0) {
			objectivePipelines.push([new AcquireItemFromDisassemble(this.itemType, disassembleSearch).passAcquireData(this)]);
		}

		if (itemDescription) {
			if (itemDescription.recipe) {
				objectivePipelines.push([new AcquireItemWithRecipe(this.itemType, itemDescription.recipe).passAcquireData(this)]);
			}

			if (itemDescription.revert !== undefined) {
				const revertItemDescription = itemDescriptions[itemDescription.revert];
				if (revertItemDescription?.lit === this.itemType) {
					objectivePipelines.push([new AcquireItemFromIgnite(itemDescription.revert).passAcquireData(this)]);
				}
			}
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
										extraDifficulty: 5 + ((100 - (leftOver.chance ?? 100)) * 5), // lower chance = higher difficulty
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
