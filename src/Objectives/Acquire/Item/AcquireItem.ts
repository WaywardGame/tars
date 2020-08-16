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
import { IObjective, ObjectiveExecutionResult } from "../../../IObjective";
import { CreatureSearch, DoodadSearch, ITerrainSearch } from "../../../ITars";
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
	private static readonly doodadSearchCache: Map<ItemType, DoodadSearch[]> = new Map();
	private static readonly creatureSearchCache: Map<ItemType, CreatureSearch> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, ItemType[]> = new Map();

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
		if (doodadSearch.length > 0) {
			objectivePipelines.push([new GatherFromDoodad(doodadSearch).passContextDataKey(this)]);
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

			const growingStages = Enums.values(GrowingStage);

			for (const doodadType of Enums.values(DoodadType)) {
				const doodadDescription = Doodads[doodadType];
				if (!doodadDescription) {
					continue;
				}

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

								search.push({
									type: doodadType,
									growingStage: growingStage,
									itemType: this.itemType,
								});

								// add the same item to a earlier growing stages but with extra difficulty
								for (const growingStage2 of growingStages) {
									if (growingStage2 >= GrowingStage.Budding) {
										const growingStageDiff = growingStage - growingStage2;
										if (growingStageDiff > 0) {
											search.push({
												type: doodadType,
												growingStage: growingStage2,
												itemType: this.itemType,
												extraDifficulty: growingStageDiff * 3,
											});
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

						for (const resourceItem of resourceItems) {
							if (resourceItem.type !== this.itemType) {
								continue;
							}

							search.push({
								type: doodadType,
								growingStage: growingStage,
								itemType: this.itemType,
							});
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

}
