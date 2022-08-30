import Doodads from "game/doodad/Doodads";
import { DoodadType, GrowingStage } from "game/doodad/IDoodad";
import { ActionArguments, ActionType } from "game/entity/action/IAction";
import Corpses from "game/entity/creature/corpse/Corpses";
import { CreatureType } from "game/entity/creature/ICreature";
import { ItemType } from "game/item/IItem";
import { itemDescriptions } from "game/item/ItemDescriptions";
import { TerrainType } from "game/tile/ITerrain";
import TerrainResources from "game/tile/TerrainResources";
import terrainDescriptions from "game/tile/Terrains";
import Dictionary from "language/Dictionary";
import Translation from "language/Translation";
import Enums from "utilities/enum/Enums";
import GatherLiquid from "game/entity/action/actions/GatherLiquid";

import type Context from "../../../core/context/Context";
import { ITerrainResourceSearch, DoodadSearchMap, CreatureSearch, ITerrainWaterSearch } from "../../../core/ITars";
import { IObjective, ObjectiveExecutionResult, ObjectiveResult } from "../../../core/objective/IObjective";
import { ItemUtilities } from "../../../utilities/Item";
import SetContextData from "../../contextData/SetContextData";
import ExecuteActionForItem, { ExecuteActionType } from "../../core/ExecuteActionForItem";
import MoveToTarget from "../../core/MoveToTarget";
import ReserveItems from "../../core/ReserveItems";
import UseProvidedItem from "../../core/UseProvidedItem";
import GatherFromBuilt from "../../gather/GatherFromBuilt";
import GatherFromChest from "../../gather/GatherFromChest";
import GatherFromCorpse from "../../gather/GatherFromCorpse";
import GatherFromCreature from "../../gather/GatherFromCreature";
import GatherFromDoodad from "../../gather/GatherFromDoodad";
import GatherFromGround from "../../gather/GatherFromGround";
import GatherFromTerrainResource from "../../gather/GatherFromTerrainResource";
import GatherFromTerrainWater from "../../gather/GatherFromTerrainWater";
import StartSolarStill from "../../other/doodad/StartSolarStill";
import StartWaterStillDesalination from "../../other/doodad/StartWaterStillDesalination";
import Idle from "../../other/Idle";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
import AcquireItemFromIgnite from "./AcquireItemAndIgnite";
import AcquireItemFromDisassemble from "./AcquireItemFromDisassemble";
import AcquireItemFromDismantle from "./AcquireItemFromDismantle";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";
import AddDifficulty from "../../core/AddDifficulty";

export default class AcquireItem extends AcquireBase {

	private static readonly terrainResourceSearchCache: Map<ItemType, ITerrainResourceSearch[]> = new Map();
	private static readonly terrainWaterSearchCache: Map<ItemType, ITerrainWaterSearch[]> = new Map();
	private static readonly doodadSearchCache: Map<ItemType, DoodadSearchMap> = new Map();
	private static readonly creatureSearchCache: Map<ItemType, CreatureSearch> = new Map();

	constructor(private readonly itemType: ItemType, private readonly options: Partial<IAcquireItemOptions> = {}) {
		super();
	}

	public getIdentifier(): string {
		return `AcquireItem:${ItemType[this.itemType]}`;
		// ${context?.getData(ContextDataType.PrioritizeBaseChests)}:${context?.getData(ContextDataType.NextActionAllowsIntermediateChest)}
	}

	public getStatus(): string | undefined {
		return `Acquiring ${Translation.nameOf(Dictionary.Item, this.itemType).getString()}`;
	}

	public override canIncludeContextHashCode(): boolean | Set<ItemType> {
		return ItemUtilities.getRelatedItemTypes(this.itemType);
	}

	public override shouldIncludeContextHashCode(context: Context): boolean {
		// we care about the context's reserved items for the nested acquire item objectives
		// for example: if there is a tree bark and we are trying to AcquireItem:String, it might assume it can dismantle the same TreeBark twice
		// because the "AcquireItem:StrippedBark" would be cached even though the sub objectives are not
		// return true;

		return context.isReservedItemType(this.itemType);
	}

	public async execute(context: Context): Promise<ObjectiveExecutionResult> {
		this.log.info(`Acquiring ${ItemType[this.itemType]}...`);

		const itemDescription = itemDescriptions[this.itemType];

		const objectivePipelines: IObjective[][] = [
			[new GatherFromGround(this.itemType, this.options).passAcquireData(this)],
			[new GatherFromChest(this.itemType, this.options).passAcquireData(this)],
			[new UseProvidedItem(this.itemType).passAcquireData(this)],
		];

		const terrainResourceSearch = this.getTerrainResourceSearch(context);
		if (terrainResourceSearch.length > 0) {
			objectivePipelines.push([new GatherFromTerrainResource(terrainResourceSearch).passAcquireData(this)]);
		}

		if (!this.options.disallowDoodadSearch) {
			const doodadSearch = this.getDoodadSearch();
			if (doodadSearch.size > 0) {
				objectivePipelines.push([new GatherFromDoodad(this.itemType, doodadSearch).passAcquireData(this)]);
			}
		}

		if (!this.options.disallowCreatureSearch) {
			const creatureSearch: CreatureSearch = this.getCreatureSearch();
			if (creatureSearch.map.size > 0) {
				objectivePipelines.push([new GatherFromCorpse(creatureSearch).passAcquireData(this)]);
				objectivePipelines.push([new GatherFromCreature(creatureSearch).passAcquireData(this)]);
			}
		}

		const dismantleSearch = ItemUtilities.getDismantleSearch(this.itemType);
		if (dismantleSearch.size > 0) {
			objectivePipelines.push([new AcquireItemFromDismantle(this.itemType, dismantleSearch).passAcquireData(this)]);
		}

		const disassembleSearch = context.utilities.item.getDisassembleSearch(context, this.itemType);
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

			if (itemDescription.returnOnUseAndDecay !== undefined) {
				const returnOnUseAndDecayItemType = itemDescription.returnOnUseAndDecay.type;

				const returnOnUseAndDecayItemDescription = itemDescriptions[returnOnUseAndDecayItemType];
				if (returnOnUseAndDecayItemDescription) {
					if (!this.options?.disallowTerrain) {
						const terrainWaterSearch = this.getTerrainWaterSearch(context, returnOnUseAndDecayItemType);
						if (terrainWaterSearch.length > 0) {
							const itemContextDataKey = this.getUniqueContextDataKey("WaterContainer");

							const objectives: IObjective[] = [];

							const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, { allowUnsafeWaterContainers: true });
							if (waterContainer) {
								objectives.push(new ReserveItems(waterContainer).passShouldKeepInInventory(this));
								objectives.push(new SetContextData(itemContextDataKey, waterContainer));

							} else {
								objectives.push(new AcquireItem(returnOnUseAndDecayItemType).passShouldKeepInInventory(this).setContextDataKey(itemContextDataKey));
							}

							objectives.push(new GatherFromTerrainWater(terrainWaterSearch, itemContextDataKey).passAcquireData(this));

							objectivePipelines.push(objectives);
						}
					}

					const doodads = context.utilities.object.findDoodads(context, "GatherLiquidDoodads", (doodad) => doodad.getLiquidGatherType() !== undefined);
					for (const doodad of doodads) {
						const liquidGatherType = doodad.getLiquidGatherType()!;
						if (returnOnUseAndDecayItemDescription.liquidGather?.[liquidGatherType] !== this.itemType) {
							continue;
						}

						const wellData = context.island.wellData[doodad.getTileId()];
						if (wellData) {
							if (this.options?.disallowWell || wellData.quantity === 0) {
								continue;
							}

						} else if (!context.utilities.doodad.isWaterStillDrinkable(doodad)) {
							if (this.options?.allowStartingWaterStill) {
								// start desalination and run back to the waterstill and wait
								const objectives: IObjective[] = [
									doodad.type === DoodadType.SolarStill ? new StartSolarStill(doodad) : new StartWaterStillDesalination(doodad),
								];

								if (this.options?.allowWaitingForWater) {
									// add difficulty to show that we don't want to idle
									objectives.push(new AddDifficulty(100));

									if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
										objectives.push(new MoveToTarget(doodad, true, { range: 5 }));
									}

									objectives.push(new Idle());
								}

								objectivePipelines.push(objectives);
							}

							continue;
						}

						const itemContextDataKey = this.getUniqueContextDataKey(`WaterContainerFor${doodad.id}`);

						const objectives: IObjective[] = [];

						// todo: allow emptying unsafe water to pick up purified still water?
						const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, { allowUnsafeWaterContainers: true });
						if (waterContainer) {
							objectives.push(new ReserveItems(waterContainer).passShouldKeepInInventory(this));
							objectives.push(new SetContextData(itemContextDataKey, waterContainer));

						} else {
							objectives.push(new AcquireItem(returnOnUseAndDecayItemType).passShouldKeepInInventory(this).setContextDataKey(itemContextDataKey));
						}

						objectives.push(
							new MoveToTarget(doodad, true),
							new ExecuteActionForItem(
								ExecuteActionType.Generic,
								[this.itemType],
								{
									genericAction: {
										action: GatherLiquid,
										args: (context) => {
											const item = context.getData(itemContextDataKey);
											if (!item?.isValid()) {
												this.log.warn("Invalid water container");
												return ObjectiveResult.Restart;
											}

											return [item] as ActionArguments<typeof GatherLiquid>;
										},
									},
								})
								.passAcquireData(this));

						objectivePipelines.push(objectives);
					}
				}
			}

			const buildInfo = itemDescription.onUse?.[ActionType.Build];
			if (buildInfo !== undefined) {
				objectivePipelines.push([new GatherFromBuilt(this.itemType, buildInfo.type).passAcquireData(this)]);
			}
		}

		return objectivePipelines;
	}

	private getTerrainResourceSearch(context: Context): ITerrainResourceSearch[] {
		let search = AcquireItem.terrainResourceSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			// prevent pickup up stuff that was placed down, such as red carpet & wooden tracks
			if (!itemDescriptions[this.itemType]?.use?.includes(ActionType.SetDown) && this.itemType !== ItemType.PlantRoots) {
				const resolvedTypes: Map<TerrainType, ITerrainResourceSearch[]> = new Map();

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
					const terrainItems = context.island.getTerrainItems(resource);
					if (resource && terrainItems && (resource.defaultItem === this.itemType || terrainItems.some(ri => ri.type === this.itemType))) {
						const terrainSearch: ITerrainResourceSearch = {
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

			AcquireItem.terrainResourceSearchCache.set(this.itemType, search);
		}

		return search;
	}

	private getTerrainWaterSearch(context: Context, returnOnUseAndDecayItemType: ItemType): ITerrainWaterSearch[] {
		let search = AcquireItem.terrainWaterSearchCache.get(this.itemType);
		if (search === undefined) {
			search = [];

			const baseItemDescriptions = itemDescriptions[returnOnUseAndDecayItemType];
			if (baseItemDescriptions.liquidGather !== undefined) {
				for (const terrainType of Enums.values(TerrainType)) {
					const terrainDescription = terrainDescriptions[terrainType];
					if (!terrainDescription) {
						continue;
					}

					const liquidGatherType = context.island.getLiquidGatherType(terrainType, terrainDescription);
					if (liquidGatherType !== undefined && baseItemDescriptions.liquidGather[liquidGatherType] === this.itemType) {
						// this.itemType can be obtained by gathering a liquid for this terrain type with the base item
						search.push({
							type: terrainType,
							itemType: this.itemType,
							gatherLiquid: returnOnUseAndDecayItemType,
						});
					}
				}
			}

			AcquireItem.terrainWaterSearchCache.set(this.itemType, search);
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

}
