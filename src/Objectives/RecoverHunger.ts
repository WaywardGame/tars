import { IStat, Stat } from "entity/IStats";
import { ActionType, GrowingStage, ItemType, ItemTypeGroup } from "Enums";
import { itemDescriptions as Items } from "item/Items";
import { ITile } from "tile/ITerrain";
import Enums from "utilities/enum/Enums";
import { IVector3 } from "utilities/math/IVector";
import * as Helpers from "../Helpers";
import { IObjective, ObjectiveStatus } from "../IObjective";
import { gardenMaxTilesChecked, IBase, IInventoryItems, MoveResult } from "../ITars";
import Objective from "../Objective";
import AcquireItem from "./AcquireItem";
import ExecuteAction from "./ExecuteAction";
import PlantSeed from "./PlantSeed";
import UseItem from "./UseItem";

export default class RecoverHunger extends Objective {

	public async onExecute(base: IBase, inventory: IInventoryItems): Promise<IObjective | ObjectiveStatus | number | undefined> {
		const hungerValue = localPlayer.getStat<IStat>(Stat.Hunger).value;
		const isImportant = hungerValue <= 3;
		const isEmergency = hungerValue < 0;

		let food = itemManager.getItemsInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Food, true);
		if (isEmergency && food.length === 0) {
			food = Helpers.getInventoryItemsWithUse(ActionType.Eat);
		}

		if (food.length > 0) {
			this.log.info(`Eating ${ItemType[food[0].type]}`);
			return new UseItem(food[0], ActionType.Eat);
		}

		// check if we can craft food based on our current items
		let objectiveSets: IObjective[][] = [];

		for (const itemType of Enums.values(ItemType)) {
			const description = Items[itemType];
			if (!description || description.craftable === false || !description.use || description.use.indexOf(ActionType.Eat) === -1) {
				continue;
			}

			const recipe = description.recipe;
			if (!recipe) {
				continue;
			}

			const checker = Helpers.processRecipe(inventory, recipe, true);
			if (checker.requirementsMet()) {
				objectiveSets.push([new AcquireItem(itemType)]);
			}
		}

		let objective = await this.pickEasiestObjective(base, inventory, objectiveSets);
		if (objective !== undefined) {
			return objective;
		}

		// gather plants
		const plantToGather = await Helpers.findAndMoveToTarget((point: IVector3, tile: ITile) => {
			if (tile.doodad === undefined || !tile.doodad.canGather()) {
				return false;
			}

			const description = tile.doodad.description();
			if (!description || description.isTree || description.gather === undefined) {
				return false;
			}

			const growingStage = tile.doodad.getGrowingStage();
			if (growingStage === undefined) {
				return false;
			}

			if (isImportant) {
				// gather if the doodad will give food
				const gatherItems = description.gather[growingStage];
				if (gatherItems) {
					for (const gatherItem of gatherItems) {
						const itemDescription = Items[gatherItem.type];
						if (itemDescription && itemDescription.group !== undefined && itemDescription.group.indexOf(ItemTypeGroup.Food) !== -1) {
							return true;
						}
					}
				}
			}

			if (isEmergency) {
				// gather if the doodad will give something to eat
				const gatherItems = description.gather[growingStage];
				if (gatherItems) {
					for (const gatherItem of gatherItems) {
						const itemDescription = Items[gatherItem.type];
						if (itemDescription && itemDescription.use !== undefined && itemDescription.use.indexOf(ActionType.Eat) !== -1) {
							return true;
						}
					}
				}
			}

			// wait for ripening
			return growingStage !== undefined && growingStage >= GrowingStage.Ripening;

		}, false, gardenMaxTilesChecked);

		if (plantToGather !== MoveResult.NoTarget) {
			if (plantToGather === MoveResult.Complete) {
				this.log.info("Gathering plant");

				return new ExecuteAction(ActionType.Gather, {
					item: Helpers.getInventoryItemsWithUse(ActionType.Gather)[0]
				});
			}

			return;
		}

		// plant seeds
		const seeds = Helpers.getSeeds();
		if (seeds.length > 0) {
			this.log.info("Plant seed");
			return new PlantSeed(seeds[0]);
		}

		// try to craft any food
		objectiveSets = [];

		for (const itemType of Enums.values(ItemType)) {
			const description = Items[itemType];
			if (!description || description.craftable === false || !description.group || description.group.indexOf(ItemTypeGroup.Food) === -1) {
				continue;
			}

			objectiveSets.push([new AcquireItem(itemType)]);
		}

		objective = await this.pickEasiestObjective(base, inventory, objectiveSets);
		if (objective !== undefined) {
			return objective;
		}

		if (!isImportant) {
			return ObjectiveStatus.Complete;
		}

		// try to craft anything edible
		objectiveSets = [];

		for (const itemType of Enums.values(ItemType)) {
			const description = Items[itemType];
			if (!description || description.craftable === false || !description.use || description.use.indexOf(ActionType.Eat) === -1) {
				continue;
			}

			objectiveSets.push([new AcquireItem(itemType)]);
		}

		objective = await this.pickEasiestObjective(base, inventory, objectiveSets);
		if (objective !== undefined) {
			return objective;
		}

		return ObjectiveStatus.Complete;

		// const plantToWater = Helpers.findTarget((point: IPointZ, tile: ITile) => {
		// 	if (tile.doodad === undefined) {
		// 		return false;
		// 	}

		// 	const description = tile.doodad.description();
		// 	if (!description || description.isTree) {
		// 		return false;
		// 	}

		// 	const growingStage = tile.doodad.getGrowingStage();
		// 	return growingStage !== undefined && growingStage < GrowingStage.Ripening;
		// }, gardenMaxTilesChecked);

		// if (plantToWater === undefined) {
		// 	return ObjectiveStatus.Complete;
		// }

		// if (inventory.waterContainer === undefined) {
		// 	return ObjectiveStatus.Complete;
		// }

		// const waterContainerDescription = inventory.waterContainer.description()!;
		// const isWaterInContainer = waterContainerDescription.use && waterContainerDescription.use.indexOf(ActionType.DrinkItem) !== -1;

		// if (isWaterInContainer) {
		// 	const moveResult = await Helpers.moveToTarget(plantToWater, false);
		// 	if (moveResult === MoveResult.Complete) {
		// 		this.log("Pour water on plant");
		// 		return new UseItem(inventory.waterContainer, ActionType.Pour);
		// 	}

		// } else {
		// 	this.log("Gather water from a water tile");
		// 	return new GatherWater(inventory.waterContainer);
		// }
	}

}
