import { ActionType } from "action/IAction";
import Corpses from "creature/corpse/Corpses";
import Doodads from "doodad/Doodads";
import { CreatureType, DoodadType, ItemType, ItemTypeGroup, TerrainType } from "Enums";
import { itemDescriptions } from "item/Items";
import TerrainResources from "tile/TerrainResources";
import Enums from "utilities/enum/Enums";
import { IObjective, missionImpossible, ObjectiveStatus } from "../IObjective";
import { IBase, ICreatureSearch, IDoodadSearch, IInventoryItems, ITerrainSearch } from "../ITars";
import Objective from "../Objective";
import { addTargetRecipe, getItemInInventory, processRecipe, resetTargetRecipes } from "../Utilities/Item";
import AcquireBuildMoveToDoodad from "./AcquireBuildMoveToDoodad";
import AcquireBuildMoveToFire from "./AcquireBuildMoveToFire";
import AcquireItemByGroup from "./AcquireItemByGroup";
import ExecuteAction from "./ExecuteAction";
import GatherFromChest from "./GatherFromChest";
import GatherFromCreature from "./GatherFromCreature";
import GatherFromDoodad from "./GatherFromDoodad";
import GatherFromGround from "./GatherFromGround";
import GatherFromTerrain from "./GatherFromTerrain";

export default class AcquireItem extends Objective {

	constructor(private readonly itemType: ItemType) {
		super();
	}

	public getHashCode(): string {
		return `AcquireItem:${itemManager.getItemTypeGroupName(this.itemType, false)}`;
	}

	public async onExecute(base: IBase, inventory: IInventoryItems, calculateDifficulty: boolean): Promise<IObjective | ObjectiveStatus | number | undefined> {
		this.log.info(`Wants a ${itemManager.getItemTypeGroupName(this.itemType, false).toString()}`);

		let itemDescription = itemDescriptions[this.itemType];

		const objectiveSets: IObjective[][] = [
			[new GatherFromGround(this.itemType)],
			[new GatherFromChest(this.itemType)]
		];

		if (!itemDescription || !itemDescription.recipe) {
			const terrainsToGatherFrom = this.getTerrainSearch([this.itemType]);
			if (terrainsToGatherFrom.length > 0) {
				objectiveSets.push([new GatherFromTerrain(terrainsToGatherFrom)]);
			}

			const doodadsToGatherFrom = this.getDoodadSearch([this.itemType]);
			if (doodadsToGatherFrom.length > 0) {
				objectiveSets.push([new GatherFromDoodad(doodadsToGatherFrom)]);
			}

			const creaturesToGatherFrom: ICreatureSearch[] = this.getCreatureSearch([this.itemType]);
			if (creaturesToGatherFrom.length > 0) {
				objectiveSets.push([new GatherFromCreature(creaturesToGatherFrom)]);
			}

			// check if we can get it from dismantling something
			const itemTypesToDismantle: ItemType[] = [];

			for (const it of Enums.values(ItemType)) {
				const description = itemDescriptions[it];
				if (description && description.dismantle) {
					for (const di of description.dismantle.items) {
						if (di[0] === this.itemType) {
							itemTypesToDismantle.push(it);
							break;
						}
					}
				}
			}

			if (itemTypesToDismantle.length > 0) {
				for (const it of itemTypesToDismantle) {
					const description = itemDescriptions[it];
					if (!description || !description.dismantle) {
						continue;
					}

					const dismantleItem = getItemInInventory(inventory, it);
					const hasItem = dismantleItem !== undefined;

					let hasRequiredItem = true;
					if (description.dismantle.required !== undefined) {
						hasRequiredItem = itemManager.countItemsInContainerByGroup(localPlayer.inventory, description.dismantle.required) > 0;
					}

					if (hasItem) {
						if (hasRequiredItem) {
							return new ExecuteAction(ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem!));

						} else {
							objectiveSets.push([new AcquireItemByGroup(description.dismantle.required!), new ExecuteAction(ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem!))]);
						}

					} else {
						const terrainsToGatherDismantleItemFrom = this.getTerrainSearch([this.itemType]);
						if (terrainsToGatherDismantleItemFrom.length > 0) {
							const objectiveSet: IObjective[] = [new GatherFromTerrain(terrainsToGatherDismantleItemFrom)];

							if (!hasRequiredItem) {
								objectiveSet.push(new AcquireItemByGroup(description.dismantle.required!));
							}

							objectiveSet.push(new ExecuteAction(ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem!)));

							objectiveSets.push(objectiveSet);
						}

						const doodadsToGatherDismantleItemFrom = this.getDoodadSearch([it]);
						if (doodadsToGatherDismantleItemFrom.length > 0) {
							const objectiveSet: IObjective[] = [new GatherFromDoodad(doodadsToGatherDismantleItemFrom)];

							if (!hasRequiredItem) {
								objectiveSet.push(new AcquireItemByGroup(description.dismantle.required!));
							}

							objectiveSet.push(new ExecuteAction(ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem!)));

							objectiveSets.push(objectiveSet);
						}

						const creaturesToGatherDismantleItemFrom = this.getCreatureSearch([it]);
						if (creaturesToGatherDismantleItemFrom.length > 0) {
							const objectiveSet: IObjective[] = [new GatherFromCreature(creaturesToGatherDismantleItemFrom)];

							if (!hasRequiredItem) {
								objectiveSet.push(new AcquireItemByGroup(description.dismantle.required!));
							}

							objectiveSet.push(new ExecuteAction(ActionType.Dismantle, action => action.execute(localPlayer, dismantleItem!)));

							objectiveSets.push(objectiveSet);
						}
					}
				}
			}

			if (objectiveSets.length > 0) {
				const objective = await this.pickEasiestObjective(base, inventory, objectiveSets);
				if (objective === undefined) {
					if (calculateDifficulty) {
						return missionImpossible;
					}

					return ObjectiveStatus.Complete;
				}

				return objective;
			}

			this.log.info(`Can't acquire item ${ItemType[this.itemType]}. Items to dismantle: ${itemTypesToDismantle.length}`);

			if (calculateDifficulty) {
				return missionImpossible;
			}

			return ObjectiveStatus.Complete;
		}

		const recipe = itemDescription.recipe;

		const checker = processRecipe(inventory, recipe, true);

		const requirementsMet = checker.requirementsMet();
		const hasAdditionalRequirements = itemManager.hasAdditionalRequirements(localPlayer, this.itemType);

		if (requirementsMet && hasAdditionalRequirements.requirementsMet) {
			if (!calculateDifficulty) {
				resetTargetRecipes();
			}

			if (localPlayer.swimming) {
				// uhh
			}

			this.log.info(`Crafting ${ItemType[this.itemType]}`);

			return new ExecuteAction(ActionType.Craft, action => action.execute(localPlayer,
				this.itemType,
				checker.itemComponentsRequired,
				checker.itemComponentsConsumed,
				checker.itemBaseComponent
			));

		} else {
			const recipeObjectives: IObjective[] = [];

			if (!calculateDifficulty) {
				addTargetRecipe(recipe);
			}

			const itemBase = checker.itemBaseComponent;

			if (recipe.baseComponent !== undefined && !itemBase) {
				this.log.info(`Need base component ${itemManager.isGroup(recipe.baseComponent) ? ItemTypeGroup[recipe.baseComponent] : ItemType[recipe.baseComponent]}`);

				if (itemManager.isGroup(recipe.baseComponent)) {
					recipeObjectives.push(new AcquireItemByGroup(recipe.baseComponent));

				} else {
					recipeObjectives.push(new AcquireItem(recipe.baseComponent));
				}
			}

			const requires = recipe.components;
			for (let i = 0; i < requires.length; i++) {
				const missingAmount = checker.amountNeededForComponent(i);
				if (missingAmount > 0) {
					const componentType = requires[i].type;
					if (typeof (componentType) === "object") {
						this.log.warn("Weird component type", componentType);
						continue;
					}

					this.log.info(`Need component. ${itemManager.isGroup(componentType) ? ItemTypeGroup[componentType] : ItemType[componentType]}`);

					for (let j = 0; j < missingAmount; j++) {
						if (itemManager.isGroup(componentType)) {
							recipeObjectives.push(new AcquireItemByGroup(componentType));

						} else {
							recipeObjectives.push(new AcquireItem(componentType));
						}
					}
				}
			}

			if (!hasAdditionalRequirements.requirementsMet) {
				if (recipe.requiresFire) {
					this.log.info("Recipe requires fire");
					recipeObjectives.push(new AcquireBuildMoveToFire());

				} else if (recipe.requiredDoodad !== undefined) {
					this.log.info("Recipe requires doodad");
					recipeObjectives.push(new AcquireBuildMoveToDoodad(recipe.requiredDoodad));

				} else if (calculateDifficulty) {
					return missionImpossible;
				}
			}

			objectiveSets.push(recipeObjectives);
		}

		const easyObjective = await this.pickEasiestObjective(base, inventory, objectiveSets);
		if (easyObjective !== undefined) {
			return easyObjective;
		}

		this.log.info(`Can't aquire item ${ItemType[this.itemType]}`);

		if (calculateDifficulty) {
			return missionImpossible;
		}

		return ObjectiveStatus.Complete;
	}

	private getTerrainSearch(itemTypes: ItemType[]): ITerrainSearch[] {
		const search: ITerrainSearch[] = [];

		for (const it of itemTypes) {
			for (const tt of Enums.values(TerrainType)) {
				const resource = TerrainResources[tt];
				if (resource) {
					let total = 0;
					let chance = 0;

					for (const ri of resource.items) {
						if (!ri.chance) {
							continue;
						}

						total += ri.chance;

						if (ri.type === it) {
							chance += ri.chance;
						}
					}

					if (resource.defaultItem === it) {
						chance += 100 - total;
					}

					if (chance > 0) {
						search.push({
							type: tt,
							itemType: it,
							chance: chance
						});
					}
				}
			}
		}

		return search;
	}

	private getDoodadSearch(itemTypes: ItemType[]): IDoodadSearch[] {
		const search: IDoodadSearch[] = [];

		for (const itemType of itemTypes) {
			for (const doodadType of Enums.values(DoodadType)) {
				const doodadDescription = Doodads[doodadType];
				if (doodadDescription) {
					if (doodadDescription.gather) {
						for (const key of Object.keys(doodadDescription.gather)) {
							const growingStage = parseInt(key, 10);
							const resourceItems = doodadDescription.gather[growingStage];
							if (resourceItems) {
								for (const resourceItem of resourceItems) {
									if (resourceItem.type === itemType) {
										search.push({
											type: doodadType,
											growingStage: growingStage,
											itemType: itemType,
											action: ActionType.Gather
										});
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
									if (resourceItem.type === itemType) {
										search.push({
											type: doodadType,
											growingStage: growingStage,
											itemType: itemType,
											action: ActionType.Harvest
										});
									}
								}
							}
						}
					}
				}
			}
		}

		return search;
	}

	private getCreatureSearch(itemTypes: ItemType[]): ICreatureSearch[] {
		const search: ICreatureSearch[] = [];

		for (const itemType of itemTypes) {
			for (const creatureType of Enums.values(CreatureType)) {
				if (creatureType !== CreatureType.Shark) {
					const corpseDescription = Corpses[creatureType];
					if (corpseDescription && corpseDescription.resource) {
						for (const resource of corpseDescription.resource) {
							if (resource.item === itemType) {
								search.push({
									type: creatureType,
									itemType: itemType
								});
							}
						}
					}
				}
			}
		}

		return search;
	}
}
