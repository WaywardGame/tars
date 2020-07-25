import Doodads from "doodad/Doodads";
import { DoodadType, GrowingStage } from "doodad/IDoodad";
import Corpses from "entity/creature/corpse/Corpses";
import { CreatureType } from "entity/creature/ICreature";
import { ItemType } from "item/IItem";
import { itemDescriptions } from "item/Items";
import { TerrainType } from "tile/ITerrain";
import TerrainResources from "tile/TerrainResources";
import Enums from "utilities/enum/Enums";

import Context from "../../../Context";
import { IExecutionTree } from "../../../Core/IPlan";
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import { CreatureSearch, DoodadSearch, ITerrainSearch } from "../../../ITars";
import Objective from "../../../Objective";
import GatherFromChest from "../../Gather/GatherFromChest";
import GatherFromCorpse from "../../Gather/GatherFromCorpse";
import GatherFromCreature from "../../Gather/GatherFromCreature";
import GatherFromDoodad from "../../Gather/GatherFromDoodad";
import GatherFromGround from "../../Gather/GatherFromGround";
import GatherFromTerrain from "../../Gather/GatherFromTerrain";

import AcquireItemFromDismantle from "./AcquireItemFromDismantle";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";

export default class AcquireItem extends Objective {

	private static readonly terrainSearchCache: Map<ItemType, ITerrainSearch[]> = new Map();
	private static readonly doodadSearchCache: Map<ItemType, DoodadSearch[]> = new Map();
	private static readonly creatureSearchCache: Map<ItemType, CreatureSearch> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, ItemType[]> = new Map();

	// todo: make count count
	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItem:${ItemType[this.itemType]}`;
	}

	public canIncludeContextHashCode(): boolean {
		return true;
	}

	public shouldIncludeContextHashCode(context: Context): boolean {
		// we care about the context's reserved items
		return true;
	}

	/**
	 * Sort AcquireItem objectives so that objectives with multiple gather objectives will be executed first
	 * This prevents TARS from obtaining one iron ore, then going back to base to smelt it, then going back to rocks to obtain a second (and this repeats)
	 * TARS should objective all the ore at the same time, then go back and smelt.
	 */
	public sort(executionTreeA: IExecutionTree<AcquireItem>, executionTreeB: IExecutionTree<AcquireItem>): number {
		const gatherObjectiveCountA = this.countGatherObjectives(executionTreeA);
		const gatherObjectiveCountB = this.countGatherObjectives(executionTreeB);

		return gatherObjectiveCountA === gatherObjectiveCountB ? 0 : gatherObjectiveCountA < gatherObjectiveCountB ? 1 : -1;
	}

	public async execute(): Promise<ObjectiveExecutionResult> {
		this.log.info(`Acquiring ${ItemType[this.itemType]}...`);

		const itemDescription = itemDescriptions[this.itemType];

		const objectivePipelines: IObjective[][] = [
			[new GatherFromGround(this.itemType)],
			[new GatherFromChest(this.itemType)],
		];

		const terrainSearch = this.getTerrainSearch();
		if (terrainSearch.length > 0) {
			objectivePipelines.push([new GatherFromTerrain(terrainSearch)]);
		}

		const doodadSearch = this.getDoodadSearch();
		if (doodadSearch.length > 0) {
			objectivePipelines.push([new GatherFromDoodad(doodadSearch)]);
		}

		const creatureSearch: CreatureSearch = this.getCreatureSearch();
		if (creatureSearch.map.size > 0) {
			objectivePipelines.push([new GatherFromCorpse(creatureSearch)]);
			objectivePipelines.push([new GatherFromCreature(creatureSearch)]);
		}

		const dismantleSearch: ItemType[] = this.getDismantleSearch();
		if (dismantleSearch.length > 0) {
			objectivePipelines.push([new AcquireItemFromDismantle(this.itemType, dismantleSearch)]);
		}

		if (itemDescription && itemDescription.recipe) {
			objectivePipelines.push([new AcquireItemWithRecipe(this.itemType, itemDescription.recipe)]);
		}

		return objectivePipelines;
	}

	private getTerrainSearch(): ITerrainSearch[] {
		let search = AcquireItem.terrainSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			// todo: figure out a better way to handle this
			if (this.itemType !== ItemType.PlantRoots) {
				for (const tt of Enums.values(TerrainType)) {
					const resource = TerrainResources[tt];
					if (resource && (resource.defaultItem === this.itemType || resource.items.some(ri => ri.type === this.itemType))) {
						search.push({
							type: tt,
							itemType: this.itemType,
							resource: resource,
						});
					}
				}
			}

			AcquireItem.terrainSearchCache.set(this.itemType, search);
		}

		return search;
	}

	private getDoodadSearch(): DoodadSearch[] {
		let search = AcquireItem.doodadSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			for (const doodadType of Enums.values(DoodadType)) {
				const doodadDescription = Doodads[doodadType];
				if (doodadDescription) {
					if (doodadDescription.gather && doodadType !== DoodadType.AppleTree) {
						for (const key of Object.keys(doodadDescription.gather)) {
							const growingStage = parseInt(key, 10);
							if ((doodadDescription.isTall && growingStage >= GrowingStage.Budding) || growingStage >= GrowingStage.Ripening) {
								const resourceItems = doodadDescription.gather[growingStage];
								if (resourceItems) {
									for (const resourceItem of resourceItems) {
										if (resourceItem.type === this.itemType) {
											search.push({
												type: doodadType,
												growingStage: growingStage,
												itemType: this.itemType,
											});
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
							if (resourceItems) {
								for (const resourceItem of resourceItems) {
									if (resourceItem.type === this.itemType) {
										search.push({
											type: doodadType,
											growingStage: growingStage,
											itemType: this.itemType,
										});
									}
								}
							}
						}
					}
				}
			}

			AcquireItem.doodadSearchCache.set(this.itemType, search);
		}

		return search;
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

	private countGatherObjectives(executionTree: IExecutionTree) {
		const walkTree = (tree: IExecutionTree) => {
			let count = 0;

			if (tree.objective.getName().startsWith("AcquireItem")) {
				if (tree.children.length === 0) {
					return -1;
				}

				// prioritize harder to gather things
				count += tree.children.reduce((count, tree) => {
					let nextCount = count;

					if (tree.objective instanceof GatherFromCreature) {
						nextCount += 5;

					} else if (tree.objective instanceof GatherFromCorpse) {
						nextCount += 4;

					} else if (tree.objective instanceof GatherFromTerrain) {
						nextCount += 3;

					} else if (tree.objective instanceof GatherFromDoodad) {
						nextCount += 3;

					} else if (tree.objective instanceof GatherFromGround) {
						nextCount += 1;
					}

					return nextCount;
				}, 0);
			}

			for (const child of tree.children) {
				const childCount = walkTree(child);
				if (childCount === -1) {
					return -1;
				}

				count += childCount;
			}

			return count;
		};

		const count = walkTree(executionTree);

		if (count === -1) {
			// don't sort this to the top
			return 0;
		}

		return count;
	}
}
