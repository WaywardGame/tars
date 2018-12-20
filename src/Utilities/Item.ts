import { ActionType } from "action/IAction";
import { EquipType, DamageType, ItemType, ItemTypeGroup, DoodadType, DoodadTypeGroup } from "Enums";
import { IItem, IContainer, IRecipe } from "item/IItem";
import Enums from "utilities/enum/Enums";
import { IInventoryItems } from "../ITars";
import Items from "item/Items";
import { log } from "./Logger";
import ItemRecipeRequirementChecker from "item/ItemRecipeRequirementChecker";
import { getDoodadTypes } from "../Helpers";

const recipes: IRecipe[] = [];

export function resetTargetRecipes() {
	recipes.length = 0;
}

export function addTargetRecipe(recipe: IRecipe) {
	if (recipes.indexOf(recipe) === -1) {
		recipes.push(recipe);

		log("addTargetRecipe", recipe);
	}
}

export function processRecipe(inventory: IInventoryItems, recipe: IRecipe, trackItems: boolean): ItemRecipeRequirementChecker {
	const checker = new ItemRecipeRequirementChecker(localPlayer, recipe, trackItems);

	// don't process using reserved items
	// todo: use protectedCraftingItems and quickslot important things
	const items = localPlayer.inventory.containedItems.filter(i => !isInventoryItem(inventory, i));
	const container: IContainer = {
		weightCapacity: localPlayer.inventory.weightCapacity,
		containedItems: items,
		itemOrders: items.map(i => i.id)
	};
	checker.processContainer(container, true);
	// checker.processAdjacent(true);

	return checker;
}

export function isUsedByTargetRecipe(inventory: IInventoryItems, item: IItem): boolean {
	for (const recipe of recipes) {
		const checker = processRecipe(inventory, recipe, true);

		if (checker.itemBaseComponent === item) {
			return true;
		}

		for (const requiredItem of checker.itemComponentsRequired) {
			if (requiredItem === item) {
				return true;
			}
		}

		for (const consumedItem of checker.itemComponentsConsumed) {
			if (consumedItem === item) {
				return true;
			}
		}
	}

	return false;
}

export function getItemInInventory(inventory: IInventoryItems, itemTypeSearch: ItemType, excludeUsefulItems: boolean = true): IItem | undefined {
	return getItemInContainer(inventory, localPlayer.inventory, itemTypeSearch, excludeUsefulItems);
}

export function getItemInContainer(inventory: IInventoryItems, container: IContainer, itemTypeSearch: ItemType, excludeUsefulItems: boolean = true): IItem | undefined {
	const orderedItems = itemManager.getOrderedContainerItems(container);
	for (const item of orderedItems) {
		if (excludeUsefulItems && isInventoryItem(inventory, item)) {
			continue;
		}

		if (item.type === itemTypeSearch) {
			return item;
		}

		const description = Items[item.type];
		if (description && description.weightCapacity !== undefined) {
			const item2 = getItemInContainer(inventory, item as IContainer, itemTypeSearch, excludeUsefulItems);
			if (item2) {
				return item2;
			}
		}
	}

	return undefined;
}

export function isInventoryItem(inventory: IInventoryItems, item: IItem) {
	return Object.keys(inventory).findIndex(key => {
		const itemOrItems: IItem | IItem[] = (inventory as any)[key];
		if (Array.isArray(itemOrItems)) {
			return itemOrItems.indexOf(item) !== -1;
		}

		return itemOrItems === item;
	}) !== -1;
}

export function getBestActionItem(use: ActionType, preferredDamageType?: DamageType): IItem | undefined {
	let possibleEquips = getPossibleHandEquips(use, preferredDamageType);
	if (possibleEquips.length === 0) {
		// fall back to not caring about the damage type
		possibleEquips = getPossibleHandEquips(use);
	}

	if (possibleEquips.length > 0) {
		return possibleEquips[0];
	}

	return undefined;
}

export function getBestEquipment(equip: EquipType): IItem[] {
	return localPlayer.inventory.containedItems.filter(item => {
		if (item.type === ItemType.AnimalPelt) {
			// we're not savages
			return false;
		}

		const description = item.description();
		return description && description.equip === equip;
	}).sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
}

export function calculateEquipItemScore(item: IItem): number {
	const description = item.description();
	if (!description || !description.defense) {
		return 0;
	}

	let score = description.defense.base;

	const resists = description.defense.resist;
	const vulns = description.defense.vulnerable;

	for (const damageType of Enums.values(DamageType)) {
		const resistValue = resists[damageType];
		if (resistValue) {
			score += resistValue;
		}

		const vulnerableValue = vulns[damageType];
		if (vulnerableValue) {
			score -= vulnerableValue;
		}
	}

	return score;
}

export function getPossibleHandEquips(use: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): IItem[] {
	return getInventoryItemsWithUse(use, filterEquipped).filter(item => {
		const description = item.description();
		return description && description.equip === EquipType.Held &&
			(preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
	}).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
}

export function getInventoryItemsWithUse(use: ActionType, filterEquipped?: boolean): IItem[] {
	return localPlayer.inventory.containedItems.filter(item => {
		if (filterEquipped && item.isEquipped()) {
			return false;
		}

		const description = item.description();
		return description && description.use && description.use.indexOf(use) !== -1;
	}).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
}

export function getUnusedItems(inventory: IInventoryItems) {
	return localPlayer.inventory.containedItems.filter(item => {
		if (item.isEquipped() || isInventoryItem(inventory, item) || isUsedByTargetRecipe(inventory, item)) {
			return false;
		}

		const description = item.description();
		if (description && description.use && (description.use.indexOf(ActionType.GatherWater) !== -1 || description.use.indexOf(ActionType.DrinkItem) !== -1)) {
			return false;
		}

		return true;
	}).sort((a, b) => a.weight < b.weight ? 1 : -1);
}

export function getSeeds(): IItem[] {
	return itemManager.getItemsInContainerByGroup(localPlayer.inventory, ItemTypeGroup.Seed, true).filter(seed => seed.minDur !== undefined && seed.minDur > 0);
}

export function getInventoryItemForDoodad(doodadTypeOrGroup: DoodadType | DoodadTypeGroup): IItem | undefined {
	const itemTypes: ItemType[] = [];
	
	const doodadTypes = getDoodadTypes(doodadTypeOrGroup);
	for (const dt of doodadTypes) {
		for (const it of Enums.values(ItemType)) {
			const itemDescription = Items[it];
			if (itemDescription && itemDescription.onUse && itemDescription.onUse[ActionType.Build] === dt) {
				itemTypes.push(it);
			}
		}
	}
	
	const matchingItems = itemManager.getItemsInContainer(localPlayer.inventory, true).filter((item) => itemTypes.indexOf(item.type) !== -1);

	return matchingItems[0];
}

