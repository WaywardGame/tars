import type { DoodadType, DoodadTypeGroup } from "game/doodad/IDoodad";
import { GrowingStage } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import type Creature from "game/entity/creature/Creature";
import { DamageType } from "game/entity/IEntity";
import { EquipType, SkillType } from "game/entity/IHuman";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type { IContainer, IRecipe } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import type Item from "game/item/Item";
import ItemRecipeRequirementChecker from "game/item/ItemRecipeRequirementChecker";
import Items, { itemDescriptions } from "game/item/Items";
import Enums from "utilities/enum/Enums";
import terrainDescriptions from "game/tile/Terrains";
import type Doodad from "game/doodad/Doodad";
import type { TerrainType } from "game/tile/ITerrain";
import doodadDescriptions from "game/doodad/Doodads";

import type Context from "../core/context/Context";
import type { IDisassemblySearch, IInventoryItems } from "../core/ITars";
import { inventoryItemInfo } from "../core/ITars";
import ItemManager from "game/item/ItemManager";
import { ContextDataType } from "../core/context/IContext";

export class ItemUtilities {

	public foodItemTypes: Set<ItemType>;
	public seedItemTypes: Set<ItemType>;

	private itemCache: Item[] | undefined;
	private readonly disassembleSearchCache: Map<ItemType, IDisassemblySearch[]> = new Map();

	public initialize(context: Context) {
		this.foodItemTypes = this.getFoodItemTypes();
		this.seedItemTypes = this.getSeedItemTypes();
	}

	public clearCache() {
		this.itemCache = undefined;
		this.disassembleSearchCache.clear();
	}

	public getBaseItems(context: Context): Item[] {
		if (this.itemCache === undefined) {
			const baseTileItems = context.utilities.base.getTileItemsNearBase(context);
			const baseChestItems = context.base.chest
				.map(chest => context.island.items.getItemsInContainer(chest, { includeSubContainers: true }))
				.flat();
			const inventoryItems = context.island.items.getItemsInContainer(context.human.inventory, { includeSubContainers: true });

			this.itemCache = baseTileItems.concat(baseChestItems).concat(inventoryItems);
		}

		return this.itemCache;
	}

	public getBaseItemsByType(context: Context, itemType: ItemType): Item[] {
		return this.getBaseItems(context).filter(item => item.type === itemType);
	}

	public getDisassembleSearch(context: Context, itemType: ItemType): IDisassemblySearch[] {
		let search = this.disassembleSearchCache.get(itemType);
		if (search === undefined) {
			search = [];

			for (const item of this.getBaseItems(context)) {
				if (!item.disassembly) {
					continue;
				}

				const description = item.description();
				if (!description || !description.disassemble || description.blockDisassembly) {
					continue;
				}

				const disassemblyResult = item.getDisassemblyItems();
				if (!disassemblyResult) {
					continue;
				}

				for (const disassemblyItem of disassemblyResult.items) {
					if (disassemblyItem.type === itemType) {
						search.push({
							item,
							disassemblyItems: disassemblyResult.items,
							requiredForDisassembly: description.requiredForDisassembly,
						});
						break;
					}
				}
			}

			this.disassembleSearchCache.set(itemType, search);
		}

		return search;
	}

	// allow processing with inventory items assuming they wont be consumed
	public processRecipe(context: Context, recipe: IRecipe, useIntermediateChest: boolean, allowInventoryItems?: boolean): ItemRecipeRequirementChecker {
		const checker = new ItemRecipeRequirementChecker(context.human, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
			if (isConsumed) {
				if (context.isHardReservedItem(item)) {
					return false;
				}

				if (!allowInventoryItems && this.isInventoryItem(context, item)) {
					return false;
				}
			}

			// if (forItemTypeOrGroup === ItemTypeGroup.Sharpened) {
			// 	// only allow the knife
			// 	return item === context.inventory.knife;
			// }

			return true;
		});

		// move the knife to the front so it will be preferred for sharpened items
		const items = this.getItemsInInventory(context)
			.slice()
			.sort((a, b) => {
				return a === context.inventory.knife ? -1 : 1;
			});

		const container: IContainer = {
			containedItems: items,
			itemOrders: items.map(i => i.id),
		};
		checker.processContainer(container);

		if (useIntermediateChest && context.base.intermediateChest[0] && !checker.requirementsMet()) {
			// process with the intermediate chest in mind
			checker.processContainer(context.base.intermediateChest[0]);
		}

		return checker;
	}

	public getItemsInInventory(context: Context, allowProtectedItems: boolean = true) {
		return context.island.items.getItemsInContainer(context.human.inventory, { includeSubContainers: true, excludeProtectedItems: !allowProtectedItems });
	}

	public getItemInInventory(context: Context, itemTypeSearch: ItemType): Item | undefined {
		return this.getItemInContainer(context, context.human.inventory, itemTypeSearch);
	}

	private getItemInContainer(
		context: Context,
		container: IContainer,
		itemTypeSearch: ItemType,
		allowInventoryItems?: boolean): Item | undefined {
		const orderedItems = context.island.items.getOrderedContainerItems(container);
		for (const item of orderedItems) {
			if (!allowInventoryItems && this.isInventoryItem(context, item)) {
				continue;
			}

			if (item.isProtected()) {
				continue;
			}

			if (item.type === itemTypeSearch) {
				if (context.isHardReservedItem(item)) {
					continue;
				}

				return item;
			}

			const description = Items[item.type];
			if (description && description.weightCapacity !== undefined) {
				const item2 = this.getItemInContainer(context, item as IContainer, itemTypeSearch, allowInventoryItems);
				if (item2) {
					return item2;
				}
			}
		}

		return undefined;
	}

	public isInventoryItem(context: Context, item: Item) {
		const keys = Object.keys(inventoryItemInfo) as Array<keyof IInventoryItems>;

		for (const key of keys) {
			const inventoryItem = context.inventory[key];
			if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
				return true;
			}
		}

		return false;
	}

	public isSafeToDrinkItem(item: Item) {
		return item.island.items.isInGroup(item.type, ItemTypeGroup.ContainerOfMedicinalWater) ||
			item.island.items.isInGroup(item.type, ItemTypeGroup.ContainerOfDesalinatedWater) ||
			item.island.items.isInGroup(item.type, ItemTypeGroup.ContainerOfPurifiedFreshWater);
	}

	public isDrinkableItem(item: Item) {
		return this.hasUseActionType(item, ActionType.DrinkItem);
	}

	public canGatherWater(item: Item) {
		return this.hasUseActionType(item, ActionType.GatherLiquid);
	}

	public hasUseActionType(item: Item, actionType: ActionType) {
		return item.description()?.use?.includes(actionType) ? true : false;
	}

	public getTools(context: Context, actionType: ActionType, preferredDamageType?: DamageType): Item[] {
		return this.getInventoryItemsWithUse(context, actionType)
			.filter(item => {
				const description = item.description();
				return description && (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
			})
			.sort((itemA, itemB) => itemB.getItemUseBonus(actionType) - itemA.getItemUseBonus(actionType));
	}

	public getBestTool(context: Context, use: ActionType, preferredDamageType?: DamageType): Item | undefined {
		let possibleEquips = this.getTools(context, use, preferredDamageType);
		if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
			// fall back to not caring about the damage type
			possibleEquips = this.getTools(context, use);
		}

		return possibleEquips.length > 0 ? possibleEquips[0] : undefined;
	}

	public getBestToolForDoodadGather(context: Context, doodad: Doodad): Item | undefined {
		const description = doodad.description();
		if (!description) {
			return undefined;
		}

		let tool: Item | undefined;

		const stage = doodad.getGrowingStage();
		if (stage !== undefined && description.harvest && description.harvest[stage]) {
			tool = this.getBestTool(context, ActionType.Harvest);

		} else {
			const skillType = description.gatherSkillUse ?? description.skillUse; // ?? SkillType.Mining;
			// const prefersBlunt = skillType === SkillType.Mining;
			tool = this.getBestTool(context, skillType === SkillType.Lumberjacking ? ActionType.Chop : ActionType.Mine); // prefersBlunt ? DamageType.Blunt : DamageType.Slashing);
		}

		return tool;
	}

	public getBestToolForTerrainGather(context: Context, terrainType: TerrainType): Item | undefined {
		const terrainDescription = terrainDescriptions[terrainType];
		if (!terrainDescription) {
			return undefined;
		}

		let tool: Item | undefined;

		if (terrainDescription.gather) {
			const prefersBlunt = (terrainDescription.gatherSkillUse ?? SkillType.Mining) === SkillType.Mining;
			tool = this.getBestTool(context, ActionType.Mine, prefersBlunt ? DamageType.Blunt : DamageType.Slashing);
		} else {
			tool = this.getBestTool(context, ActionType.Dig);
		}

		return tool;
	}

	public getBestEquipment(context: Context, equip: EquipType): Item[] {
		return this.getItemsInInventory(context)
			.filter(item => {
				if (item.type === ItemType.AnimalPelt) {
					// we're not savages
					return false;
				}

				const description = item.description();
				return description && description.equip === equip;
			})
			.sort((a, b) => this.calculateEquipItemScore(b) - this.calculateEquipItemScore(a));
	}

	public calculateEquipItemScore(item: Item): number {
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

	public estimateDamageModifier(weapon: Item, target: Creature): number {
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

	public getPossibleHandEquips(context: Context, actionType: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): Item[] {
		const items = this.getInventoryItemsWithUse(context, actionType, filterEquipped)
			.filter(item => {
				const description = item.description();
				return description && description.equip === EquipType.Held &&
					(preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
			});
		if (actionType !== ActionType.Attack) {
			return items.sort((itemA, itemB) => itemB.getItemUseBonus(actionType) - itemA.getItemUseBonus(actionType));
		}

		return items;
	}

	public getInventoryItemsWithEquipType(context: Context, equipType: EquipType): Item[] {
		return this.getItemsInInventory(context)
			.filter(item => {
				const description = item.description();
				return description && description.equip === equipType;
			});
	}

	public hasInventoryItemForAction(context: Context, actionType: ActionType): boolean {
		return this.getItemsInInventory(context)
			.some(item => {
				const description = item.description();
				if (!description) {
					return false;
				}

				if (actionType === ActionType.Attack) {
					return description.attack !== undefined;
				}

				return description.use && description.use.includes(actionType);
			});
	}

	public getInventoryItemsWithUse(context: Context, use: ActionType, filterEquipped?: boolean): Item[] {
		return this.getItemsInInventory(context)
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

				return description.use && description.use.includes(use);
			})
			.sort((a, b) => {
				if (use === ActionType.Attack) {
					const descriptionA = a.description();
					const descriptionB = b.description();
					if (descriptionA !== undefined && descriptionB !== undefined &&
						descriptionA.attack !== undefined && descriptionB.attack !== undefined &&
						descriptionA.damageType !== undefined && descriptionB.damageType !== undefined) {
						if (descriptionA.attack === descriptionB.attack) {
							const damageTypesA = Enums.values(DamageType).filter(type => (descriptionA.damageType! & type) === type).length;
							const damageTypesB = Enums.values(DamageType).filter(type => (descriptionB.damageType! & type) === type).length;

							return damageTypesB - damageTypesA;
						}

						return descriptionB.attack - descriptionA.attack;
					}
				}

				return a.minDur !== undefined && b.minDur !== undefined ? b.minDur - a.minDur : 0;
			});
	}

	/**
	 * Returns reserved items (items that are marked as in use by objectives)
	 * @param context Context
	 * @param includeKeepInInventoryItems True to include items marked with KeepInInventoryItem in the result
	 */
	public getReservedItems(context: Context, includeKeepInInventoryItems: boolean) {
		const keepInInventoryItems = context.getDataOrDefault<Set<Item>>(ContextDataType.KeepInInventoryItems, new Set());

		let reservedItems = this.getItemsInInventory(context)
			.filter(item => context.isHardReservedItem(item) && !this.isInventoryItem(context, item));
		if (!includeKeepInInventoryItems) {
			reservedItems = reservedItems.filter(item => !keepInInventoryItems.has(item));
		}

		return reservedItems;
	}

	/**
	 * Returns unused items sorted by oldest to newest
	 */
	public getUnusedItems(context: Context, options: Partial<{ allowReservedItems: boolean; allowSailboat: boolean }> = {}) {
		const items = this.getItemsInInventory(context);
		return items
			.filter(item => {
				if (item.isEquipped() ||
					((!options.allowSailboat || item !== context.inventory.sailBoat) && this.isInventoryItem(context, item)) ||
					(!options.allowReservedItems && context.isReservedItem(item))) {
					return false;
				}

				// const description = item.description();
				// if (description?.use && (description.use.includes(ActionType.GatherWater) || (description.use.includes(ActionType.DrinkItem) && !description.tier?.[ItemTypeGroup.FrozenWater]))) {
				// 	return false;
				// }

				return true;
			})
			.sort((a, b) => items.indexOf(a) - items.indexOf(b));
	}

	public getAvailableInventoryWeight(context: Context) {
		const items = this.getItemsInInventory(context)
			.filter(item => this.isInventoryItem(context, item));
		const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
		return context.human.stat.get<IStatMax>(Stat.Weight).max - itemsWeight;
	}

	public getSeeds(context: Context): Item[] {
		const baseItems = this.getBaseItems(context);
		return baseItems.filter(
			item =>
				item.minDur !== undefined &&
				item.minDur > 0 &&
				this.seedItemTypes.has(item.type)
		);
	}

	public getInventoryItemForDoodad(context: Context, doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Item | undefined {
		const itemTypes: ItemType[] = [];

		const doodadTypes = context.utilities.doodad.getDoodadTypes(doodadTypeOrGroup);
		for (const dt of doodadTypes) {
			for (const it of Enums.values(ItemType)) {
				const itemDescription = Items[it];
				if (itemDescription && itemDescription.onUse && itemDescription.onUse[ActionType.Build] === dt) {
					itemTypes.push(it);
				}
			}
		}

		const matchingItems = context.island.items.getItemsInContainer(context.human.inventory, { includeSubContainers: true }).filter(item => itemTypes.includes(item.type));

		return matchingItems[0];
	}

	/**
	 * Get a list of item types that are healthy to eat
	 */
	private getFoodItemTypes(): Set<ItemType> {
		const result: Set<ItemType> = new Set();

		const goodFoodItems = [ItemTypeGroup.Vegetable, ItemTypeGroup.Fruit, ItemTypeGroup.Bait, ItemTypeGroup.CookedFood, ItemTypeGroup.CookedMeat, ItemTypeGroup.Seed];

		for (const itemTypeOrGroup of goodFoodItems) {
			const itemTypes = ItemManager.isGroup(itemTypeOrGroup) ? ItemManager.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
			for (const itemType of itemTypes) {
				if (this.isHealthyToEat(itemType)) {
					result.add(itemType);
				}
			}
		}

		return result;
	}

	/**
	 * Get a list of item types that are plantable and produce doodads with items that are healthy to eat
	 */
	private getSeedItemTypes(): Set<ItemType> {
		const result: Set<ItemType> = new Set();

		const growingStages = Enums.values(GrowingStage);

		for (const itemType of Enums.values(ItemType)) {
			const description = itemDescriptions[itemType];
			const doodadType = description?.onUse?.[ActionType.Plant];
			if (doodadType === undefined) {
				continue;
			}

			const gatherDoodadDescription = doodadDescriptions[doodadType]?.gather;
			if (gatherDoodadDescription === undefined) {
				continue;
			}

			for (const growingStage of growingStages) {
				const resourceItems = gatherDoodadDescription[growingStage];
				if (!resourceItems) {
					continue;
				}

				for (const resourceItem of resourceItems) {
					if (this.isHealthyToEat(resourceItem.type)) {
						result.add(itemType);
					}
				}
			}
		}

		return result;
	}

	private isHealthyToEat(itemType: ItemType): boolean {
		const onEat = itemDescriptions[itemType]?.onUse?.[ActionType.Eat];
		return onEat !== undefined && onEat[0] > 1;
	}
}
