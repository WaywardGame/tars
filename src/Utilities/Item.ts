import { DoodadType, DoodadTypeGroup } from "doodad/IDoodad";
import { ActionType } from "entity/action/IAction";
import Creature from "entity/creature/Creature";
import { DamageType } from "entity/IEntity";
import { EquipType } from "entity/IHuman";
import { IStatMax, Stat } from "entity/IStats";
import { IContainer, IRecipe, ItemType, ItemTypeGroup } from "item/IItem";
import Item from "item/Item";
import ItemRecipeRequirementChecker from "item/ItemRecipeRequirementChecker";
import Items from "item/Items";
import Enums from "utilities/enum/Enums";

import Context from "../Context";
import { IInventoryItems, inventoryItemInfo } from "../ITars";

import { getDoodadTypes } from "./Doodad";

// allow processing with inventory items assuming they wont be consumed
export function processRecipe(context: Context, recipe: IRecipe, useIntermediateChest: boolean): ItemRecipeRequirementChecker {
	const checker = new ItemRecipeRequirementChecker(context.player, recipe, true, false, (item, isConsumed) =>
		!isConsumed || (!context.isReservedItem(item) && !isInventoryItem(context, item)));

	const items = context.player.inventory.containedItems;
	const container: IContainer = {
		weightCapacity: context.player.inventory.weightCapacity,
		containedItems: items,
		itemOrders: items.map(i => i.id),
	};
	checker.processContainer(container, true);

	if (useIntermediateChest && context.base.intermediateChest[0] && !checker.requirementsMet()) {
		// process with the intermediate chest in mind
		checker.processContainer(context.base.intermediateChest[0], true);
	}

	return checker;
}

export function getItemInInventory(context: Context, itemTypeSearch: ItemType): Item | undefined {
	return getItemInContainer(context, context.player.inventory, itemTypeSearch, true);
}

export function getItemInContainer(context: Context, container: IContainer, itemTypeSearch: ItemType, excludeUsefulItems: boolean = true): Item | undefined {
	const orderedItems = itemManager.getOrderedContainerItems(container);
	for (const item of orderedItems) {
		if (excludeUsefulItems && isInventoryItem(context, item)) {
			continue;
		}

		if (item.type === itemTypeSearch) {
			if (context.isReservedItem(item)) {
				continue;
			}

			return item;
		}

		const description = Items[item.type];
		if (description && description.weightCapacity !== undefined) {
			const item2 = getItemInContainer(context, item as IContainer, itemTypeSearch, excludeUsefulItems);
			if (item2) {
				return item2;
			}
		}
	}

	return undefined;
}

export function isInventoryItem(context: Context, item: Item) {
	const keys = Object.keys(inventoryItemInfo) as Array<keyof IInventoryItems>;

	for (const key of keys) {
		if (context.inventory[key] === item) {
			return true;
		}
	}

	return false;
}

export function canDrinkItem(item: Item) {
	const waterContainerDescription = item.description()!;
	return (waterContainerDescription.use && waterContainerDescription.use.indexOf(ActionType.DrinkItem) !== -1) ? true : false;
}

export function getBestActionItem(context: Context, use: ActionType, preferredDamageType?: DamageType): Item | undefined {
	let possibleEquips = getPossibleHandEquips(context, use, preferredDamageType);
	if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
		// fall back to not caring about the damage type
		possibleEquips = getPossibleHandEquips(context, use);
	}

	if (possibleEquips.length > 0) {
		return possibleEquips[0];
	}

	return undefined;
}

export function getBestEquipment(context: Context, equip: EquipType): Item[] {
	return context.player.inventory.containedItems
		.filter(item => {
			if (item.type === ItemType.AnimalPelt) {
				// we're not savages
				return false;
			}

			const description = item.description();
			return description && description.equip === equip;
		})
		.sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
}

export function calculateEquipItemScore(item: Item): number {
	const description = item.description();
	if (!description || !description.defense) {
		return 0;
	}

	let score = 4 * description.defense.base;

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

export function estimateDamageModifier(weapon: Item, target: Creature): number {
	const weaponDescription = weapon.description();
	const creatureDescription = target.description();
	if (!weaponDescription || !creatureDescription) {
		return -99;
	}

	const weaponAttack = weaponDescription.attack;
	const weaponDamageType = weaponDescription.damageType;
	if (weaponAttack === undefined || weaponDamageType === undefined) {
		return -99;
	}

	const defense = creatureDescription.defense;

	const resists = defense.resist;
	const vulnerabilities = defense.vulnerable;

	let resist = 0;
	let vulnerable = 0;

	for (const damageType of Enums.values(DamageType)) {
		if ((weaponDamageType & damageType) && resists[damageType]) {
			resist += resists[damageType];
		}

		if ((weaponDamageType & damageType) && vulnerabilities[damageType]) {
			vulnerable += vulnerabilities[damageType];
		}
	}

	return weaponAttack + vulnerable - resist;
}

export function getPossibleHandEquips(context: Context, use: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): Item[] {
	return getInventoryItemsWithUse(context, use, filterEquipped)
		.filter(item => {
			const description = item.description();
			return description && description.equip === EquipType.Held &&
				(preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
		});
}

export function getInventoryItemsWithEquipType(context: Context, equipType: EquipType): Item[] {
	return context.player.inventory.containedItems.filter(item => {
		const description = item.description();
		return description && description.equip === equipType;
	});
}

export function getInventoryItemsWithUse(context: Context, use: ActionType, filterEquipped?: boolean): Item[] {
	return context.player.inventory.containedItems
		.filter(item => {
			if (filterEquipped && item.isEquipped()) {
				return false;
			}

			const description = item.description();
			if (!description) {
				return false;
			}

			if (use === ActionType.Attack) {
				return description.attack !== undefined;
			}

			return description.use && description.use.indexOf(use) !== -1;
		})
		.sort((a, b) => {
			if (use === ActionType.Attack) {
				const descriptionA = a.description();
				const descriptionB = b.description();
				if (descriptionA !== undefined && descriptionB !== undefined &&
					descriptionA.attack !== undefined && descriptionB.attack !== undefined &&
					descriptionA.damageType !== undefined && descriptionB.damageType !== undefined) {
					if (descriptionA.attack === descriptionB.attack) {
						const damageTypesA = Enums.values(DamageType).filter(type => (descriptionA.damageType! & type) === type).length();
						const damageTypesB = Enums.values(DamageType).filter(type => (descriptionB.damageType! & type) === type).length();

						return damageTypesA < damageTypesB ? 1 : -1;
					}

					return descriptionA.attack < descriptionB.attack ? 1 : -1;
				}
			}

			return a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0;
		});
}

export function getReservedItems(context: Context) {
	return context.player.inventory.containedItems
		.filter(item => context.isReservedItem(item) && !isInventoryItem(context, item));
}

/**
 * Returns unused items sorted by oldest to newest
 */
export function getUnusedItems(context: Context, ignoreReserved: boolean = false) {
	return context.player.inventory.containedItems
		.filter(item => {
			if (item.isEquipped() || isInventoryItem(context, item) || (!ignoreReserved && context.isReservedItem(item))) {
				return false;
			}

			const description = item.description();
			if (description && description.use && (description.use.indexOf(ActionType.GatherWater) !== -1 || description.use.indexOf(ActionType.DrinkItem) !== -1)) {
				return false;
			}

			return true;
		})
		.sort((a, b) => context.player.inventory.containedItems.indexOf(a) > context.player.inventory.containedItems.indexOf(b) ? 1 : -1);
}

export function getAvailableInventoryWeight(context: Context) {
	const items = context.player.inventory.containedItems
		.filter(item => isInventoryItem(context, item));
	const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
	return context.player.getStat<IStatMax>(Stat.Weight).max - itemsWeight;
}

export function getSeeds(context: Context): Item[] {
	return itemManager.getItemsInContainerByGroup(context.player.inventory, ItemTypeGroup.Seed, true)
		.filter(seed => seed.minDur !== undefined && seed.minDur > 0 && seed.type !== ItemType.GrassSeeds && seed.type !== ItemType.MapleSeeds);
}

export function getInventoryItemForDoodad(context: Context, doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Item | undefined {
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

	const matchingItems = itemManager.getItemsInContainer(context.player.inventory, true).filter(item => itemTypes.indexOf(item.type) !== -1);

	return matchingItems[0];
}
