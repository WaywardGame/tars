import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import { DoodadType, DoodadTypeGroup, GrowingStage } from "@wayward/game/game/doodad/IDoodad";
import type { ActionArgumentsOf } from "@wayward/game/game/entity/action/IAction";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import GatherLiquid from "@wayward/game/game/entity/action/actions/GatherLiquid";
import { CreatureType } from "@wayward/game/game/entity/creature/ICreature";
import { corpseDescriptions } from "@wayward/game/game/entity/creature/corpse/Corpses";
import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import { itemDescriptions } from "@wayward/game/game/item/ItemDescriptions";
import { TerrainType } from "@wayward/game/game/tile/ITerrain";
import TerrainResources from "@wayward/game/game/tile/TerrainResources";
import Dictionary from "@wayward/game/language/Dictionary";
import Translation from "@wayward/game/language/Translation";
import Enums from "@wayward/game/utilities/enum/Enums";

import { terrainDescriptions } from "@wayward/game/game/tile/Terrains";
import type { CreatureSearch, DoodadSearchMap, ITerrainResourceSearch, ITerrainWaterSearch } from "../../../core/ITars";
import type Context from "../../../core/context/Context";
import type { IObjective, ObjectiveExecutionResult } from "../../../core/objective/IObjective";
import { ObjectiveResult } from "../../../core/objective/IObjective";
import { ItemUtilities, RelatedItemType } from "../../../utilities/ItemUtilities";
import SetContextData from "../../contextData/SetContextData";
import AddDifficulty from "../../core/AddDifficulty";
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
import Idle from "../../other/Idle";
import StartWaterSourceDoodad from "../../other/doodad/StartWaterSourceDoodad";
import type { IAcquireItemOptions } from "./AcquireBase";
import AcquireBase from "./AcquireBase";
import AcquireItemFromIgnite from "./AcquireItemAndIgnite";
import AcquireItemFromDisassemble from "./AcquireItemFromDisassemble";
import AcquireItemFromDismantle from "./AcquireItemFromDismantle";
import AcquireItemWithRecipe from "./AcquireItemWithRecipe";

export default class AcquireItem extends AcquireBase {

	private static readonly terrainResourceSearchCache = new Map<ItemType, ITerrainResourceSearch[]>();
	private static readonly terrainWaterSearchCache = new Map<ItemType, ITerrainWaterSearch[]>();
	private static readonly doodadSearchCache = new Map<ItemType, DoodadSearchMap>();
	private static readonly creatureSearchCache = new Map<ItemType, CreatureSearch>();

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
		return ItemUtilities.getRelatedItemTypes(this.itemType, RelatedItemType.All);
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
			if (itemDescription.recipe && itemDescription.craftable !== false) {
				if (this.options.allowCraftingForUnmetRequiredDoodads ||
					!itemDescription.recipe.requiredDoodads ||
					(itemDescription.recipe.requiredDoodads && context.base.anvil.length > 0)) {
					objectivePipelines.push([new AcquireItemWithRecipe(this.itemType, itemDescription.recipe).passAcquireData(this)]);
				}
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

							// notes for future reference:
							// 1. the water container must be kept in the inventory in order to gather the water, so we must explicitly call keepInInventory instead of passShouldKeepInInventory
							const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, {
								// allowUnsafeWaterContainers: true, the water container might be stolen (related to interrupts?) by AnalyzeInventory, so allowInventoryItems should be set }
								allowInventoryItems: true,
							});
							if (waterContainer) {
								objectives.push(new ReserveItems(waterContainer).keepInInventory());
								objectives.push(new SetContextData(itemContextDataKey, waterContainer));

							} else {
								objectives.push(new AcquireItem(returnOnUseAndDecayItemType).keepInInventory().setContextDataKey(itemContextDataKey));
							}

							objectives.push(new GatherFromTerrainWater(terrainWaterSearch, itemContextDataKey).passAcquireData(this));

							objectivePipelines.push(objectives);
						}
					}

					const doodads = context.utilities.object.findDoodads(context, "GatherLiquidDoodads", doodad => doodad.getLiquidGatherType() !== undefined);
					for (const doodad of doodads) {
						const liquidGatherType = doodad.getLiquidGatherType()!;
						if (returnOnUseAndDecayItemDescription.liquidGather?.[liquidGatherType] !== this.itemType) {
							continue;
						}

						const well = doodad.isInGroup(DoodadTypeGroup.Well) ? doodad.tile.well : undefined;
						if (well) {
							if (this.options?.disallowWell || well.quantity === 0) {
								continue;
							}

						} else if (!context.utilities.doodad.isWaterSourceDoodadGatherable(doodad)) {
							if (this.options?.allowStartingWaterSourceDoodads) {
								// start desalination and run back to the waterstill and wait
								const objectives: IObjective[] = [
									new StartWaterSourceDoodad(doodad),
								];

								// add difficulty to show that we don't want to idle
								// difficulty is based on how long until the water is gatherable
								objectives.push(new AddDifficulty(100 + (context.utilities.doodad.getTurnsUntilWaterSourceIsGatherable(doodad) * 2)));

								if (this.options?.allowWaitingForWater) {
									if (!this.options?.onlyIdleWhenWaitingForWaterStill) {
										objectives.push(new MoveToTarget(doodad, true, { range: 5 }));
									}

									objectives.push(new Idle().setStatus(`Waiting for ${doodad.getName()}`));
								}

								objectivePipelines.push(objectives);
							}

							continue;
						}

						const itemContextDataKey = this.getUniqueContextDataKey(`WaterContainerFor${doodad.id}`);

						const objectives: IObjective[] = [];

						// notes for future reference:
						// 1. the water container must be kept in the inventory in order to gather the water, so we must explicitly call keepInInventory instead of passShouldKeepInInventory
						// todo: allow emptying unsafe water to pick up purified still water?
						const waterContainer = context.utilities.item.getItemInInventory(context, returnOnUseAndDecayItemType, { allowUnsafeWaterContainers: true });
						if (waterContainer) {
							objectives.push(new ReserveItems(waterContainer).keepInInventory());
							objectives.push(new SetContextData(itemContextDataKey, waterContainer));

						} else {
							objectives.push(new AcquireItem(returnOnUseAndDecayItemType).keepInInventory().setContextDataKey(itemContextDataKey));
						}

						objectives.push(
							new MoveToTarget(doodad, true),
							new ExecuteActionForItem(
								ExecuteActionType.Generic,
								[this.itemType],
								{
									genericAction: {
										action: GatherLiquid,
										args: context => {
											const item = context.getData(itemContextDataKey);
											if (!item?.isValid) {
												this.log.warn("Invalid water container");
												return ObjectiveResult.Restart;
											}

											return [item] as ActionArgumentsOf<typeof GatherLiquid>;
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
			let exclude = false;

			if (itemDescriptions[this.itemType]?.use?.includes(ActionType.SetDown)) {
				const isHousingOrTrack = context.island.items.isInGroup(this.itemType, ItemTypeGroup.Housing) || context.island.items.isInGroup(this.itemType, ItemTypeGroup.Track);
				if (isHousingOrTrack) {
					exclude = true;
				}
			}

			if (!exclude && this.itemType !== ItemType.PlantRoots) {
				const resolvedTypes = new Map<TerrainType, ITerrainResourceSearch[]>();

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

				const doodadDescription = doodadDescriptions[doodadType];
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

				const searchMap = new Map<GrowingStage, number>();

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
						const growingStage = parseInt(key, 10) as GrowingStage;
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
					const corpseDescription = corpseDescriptions[creatureType];
					if (corpseDescription?.resource) {
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
