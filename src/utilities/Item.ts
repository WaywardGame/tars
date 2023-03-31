import type Doodad from "game/doodad/Doodad";
import { doodadDescriptions } from "game/doodad/Doodads";
import type { DoodadType, DoodadTypeGroup, IDoodadDescription } from "game/doodad/IDoodad";
import { GrowingStage } from "game/doodad/IDoodad";
import { ActionType } from "game/entity/action/IAction";
import type Creature from "game/entity/creature/Creature";
import { AttackType, DamageType } from "game/entity/IEntity";
import { EquipType, SkillType } from "game/entity/IHuman";
import type { IStatMax } from "game/entity/IStats";
import { Stat } from "game/entity/IStats";
import type { IContainer, IRecipe } from "game/item/IItem";
import { ItemType, ItemTypeGroup } from "game/item/IItem";
import { terrainDescriptions } from "game/tile/Terrains";
import type Item from "game/item/Item";
import { itemDescriptions } from "game/item/ItemDescriptions";
import ItemRecipeRequirementChecker from "game/item/ItemRecipeRequirementChecker";
import type { TerrainType } from "game/tile/ITerrain";
import Enums from "utilities/enum/Enums";

import { IGetItemsOptions } from "game/item/IItemManager";
import ItemManager from "game/item/ItemManager";
import Vector2 from "utilities/math/Vector2";
import type Context from "../core/context/Context";
import { ContextDataType } from "../core/context/IContext";
import { IDisassemblySearch, inventoryBuildItems } from "../core/ITars";
import { TarsUseProtectedItems } from "../core/ITarsOptions";
// import { IslandId } from "game/island/IIsland";

export const defaultGetItemOptions: Readonly<Partial<IGetItemsOptions>> = { includeSubContainers: true };

export enum RelatedItemType {
	All,
	Recipe,
	Disassemble,
	Dismantle,
}

export interface IGetItemOptions {
	allowInventoryItems: boolean;
	allowUnsafeWaterContainers: boolean;
	onlyAllowReservedItems: boolean;
}

export class ItemUtilities {

	// private static readonly impossibleItems: Map<IslandId, { withoutCaves: Set<ItemType>; withCaves: Set<ItemType> }> = new Map();

	private static readonly relatedItemsCache: Map<string, Set<ItemType>> = new Map();
	private static readonly relatedItemsByGroupCache: Map<ItemTypeGroup, Set<ItemType>> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, Set<ItemType>> = new Map();

	public foodItemTypes: Set<ItemType>;
	public allSeedItemTypes: Set<ItemType>;
	public edibleSeedItemTypes: Set<ItemType>;

	private availableInventoryWeightCache: number | undefined;
	private baseTileItemCache: Set<Item> | undefined;
	private baseItemCache: Item[] | undefined;
	private readonly groundItemCache: Map<ItemType, Item[]> = new Map();
	private readonly disassembleSearchCache: Map<ItemType, IDisassemblySearch[]> = new Map();

	/**
	 * All item types related to the provided one
	 */
	public static getRelatedItemTypes(itemType: ItemType, relatedItemType: RelatedItemType): Set<ItemType> | boolean {
		const cacheId = `${itemType},${relatedItemType}`;
		let result = this.relatedItemsCache.get(cacheId);
		if (result === undefined) {
			result = new Set();

			let queue: ItemType[] = [itemType];

			while (queue.length > 0) {
				const otherItemType = queue.shift()!;

				if (result.has(otherItemType)) {
					continue;
				}

				result.add(otherItemType);

				const description = itemDescriptions[otherItemType];
				if (!description) {
					continue;
				}

				if (relatedItemType === RelatedItemType.All || relatedItemType === RelatedItemType.Dismantle || otherItemType !== itemType) {
					const dismantleItems = description.dismantle?.items;
					if (dismantleItems) {
						queue.push(...dismantleItems.map(dismantleItem => dismantleItem.type));
					}
				}

				if (relatedItemType === RelatedItemType.All || relatedItemType === RelatedItemType.Recipe || otherItemType !== itemType) {
					const recipe = description.recipe;
					if (recipe) {
						if (recipe.baseComponent) {
							if (ItemManager.isGroup(recipe.baseComponent)) {
								queue.push(...Array.from(ItemManager.getGroupItems(recipe.baseComponent)));

							} else {
								queue.push(recipe.baseComponent);
							}
						}

						for (const component of recipe.components) {
							if (ItemManager.isGroup(component.type)) {
								queue.push(...Array.from(ItemManager.getGroupItems(component.type)));

							} else {
								queue.push(component.type);
							}
						}
					}
				}

				if (relatedItemType === RelatedItemType.All || relatedItemType === RelatedItemType.Dismantle || otherItemType !== itemType) {
					queue.push(...Array.from(this.getDismantleSearch(otherItemType)));
				}
			}

			this.relatedItemsCache.set(cacheId, result);
		}

		return result;
	}

	/**
	 * All item types related to the provided one
	 */
	public static getRelatedItemTypesByGroup(itemTypeGroup: ItemTypeGroup): Set<ItemType> | boolean {
		let result = this.relatedItemsByGroupCache.get(itemTypeGroup);
		if (result === undefined) {
			result = new Set();

			for (const itemTypeForGroup of ItemManager.getGroupItems(itemTypeGroup)) {
				const relatedItemTypes = this.getRelatedItemTypes(itemTypeForGroup, RelatedItemType.All);
				if (relatedItemTypes instanceof Set) {
					for (const itemType of relatedItemTypes) {
						result.add(itemType);
					}
				}
			}

			this.relatedItemsByGroupCache.set(itemTypeGroup, result);
		}

		return result;
	}

	/**
	 * itemDescriptions that can be dismantled to get the provided one
	 */
	public static getDismantleSearch(itemType: ItemType): Set<ItemType> {
		let search = this.dismantleSearchCache.get(itemType);
		if (search === undefined) {
			search = new Set();

			for (const it of Enums.values(ItemType)) {
				const description = itemDescriptions[it];
				if (description && description.dismantle) {
					for (const di of description.dismantle.items) {
						if (di.type === itemType) {
							search.add(it);
							break;
						}
					}
				}
			}

			this.dismantleSearchCache.set(itemType, search);
		}

		return search;
	}

	public initialize(context: Context) {
		this.foodItemTypes = this.getFoodItemTypes();
		this.allSeedItemTypes = this.getSeedItemTypes(false);
		this.edibleSeedItemTypes = this.getSeedItemTypes(true);
	}

	public clearCache() {
		this.availableInventoryWeightCache = undefined;
		this.baseItemCache = undefined;
		this.baseTileItemCache = undefined;
		this.groundItemCache.clear();
		this.disassembleSearchCache.clear();
	}

	public getBaseItems(context: Context): Item[] {
		if (this.baseItemCache === undefined) {
			const baseTileItems = Array.from(this.getBaseTileItems(context));
			const baseChestItems = context.base.chest
				.map(chest => this.getItemsInContainer(context, chest as IContainer))
				.flat();
			const inventoryItems = this.getItemsInInventory(context);

			this.baseItemCache = baseTileItems
				.concat(baseChestItems)
				.concat(inventoryItems);
		}

		return this.baseItemCache;
	}

	public getBaseTileItems(context: Context): Set<Item> {
		if (this.baseTileItemCache === undefined) {
			this.baseTileItemCache = new Set(context.utilities.base.getTileItemsNearBase(context));
		}

		return this.baseTileItemCache;
	}

	public getBaseItemsByType(context: Context, itemType: ItemType): Item[] {
		return this.getBaseItems(context).filter(item => item.type === itemType);
	}

	public getGroundItems(context: Context, itemType: ItemType): Item[] {
		let cachedItems = this.groundItemCache.get(itemType);
		if (cachedItems === undefined) {
			cachedItems = context.island.items.getObjects()
				.filter((item) =>
					item !== undefined &&
					item.type === itemType &&
					context.island.items.isTileContainer(item.containedWithin)) as Item[];
			this.groundItemCache.set(itemType, cachedItems);
		}

		return cachedItems;
	}

	public getDisassembleSearch(context: Context, itemType: ItemType): IDisassemblySearch[] {
		let search = this.disassembleSearchCache.get(itemType);
		if (search === undefined) {
			search = [];

			for (const item of this.getBaseItems(context)) {
				if (!item.disassembly) {
					continue;
				}

				const description = item.description;
				if (!description || !description.disassemble) {
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

	public isAllowedToUseItem(context: Context, item: Item, allowProtectedInventoryItems = true) {
		if (context.options.useProtectedItems !== TarsUseProtectedItems.Yes && item.isProtected()) {
			if (allowProtectedInventoryItems && this.isInventoryItem(context, item)) {
				return true;
			}

			if (context.options.useProtectedItems === TarsUseProtectedItems.No) {
				return false;
			}

			if (item.durability !== undefined && item.durability < 5) {
				return false;
			}
		}

		return true;
	}

	public isAllowedToUseEquipItem(context: Context, item: Item) {
		if (context.options.useProtectedItems !== TarsUseProtectedItems.Yes && item.isProtected()) {
			if (this.isInventoryItem(context, item)) {
				return true;
			}

			if (context.options.useProtectedItems === TarsUseProtectedItems.No && !context.options.useProtectedItemsForEquipment) {
				return false;
			}

			if (item.durability !== undefined && item.durability < 5) {
				return false;
			}
		}

		return true;
	}

	// allow processing with inventory items assuming they wont be consumed
	public processRecipe(context: Context, recipe: IRecipe, useIntermediateChest: boolean, options?: Partial<IGetItemOptions>): ItemRecipeRequirementChecker {
		const checker = new ItemRecipeRequirementChecker(context.human, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
			if (options?.onlyAllowReservedItems && !context.isReservedItem(item)) {
				return false;
			}

			if (isConsumed) {
				if (context.isHardReservedItem(item)) {
					return false;
				}

				if (!options?.allowInventoryItems && this.isInventoryItem(context, item, options)) {
					return false;
				}
			}

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
			checker.processContainer(context.base.intermediateChest[0] as IContainer);
		}

		return checker;
	}

	public getItemsInContainer(context: Context, container: IContainer) {
		return context.island.items.getItemsInContainer(container, defaultGetItemOptions)
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getItemsInContainerByType(context: Context, container: IContainer, itemType: ItemType) {
		return context.island.items.getItemsInContainerByType(container, itemType, defaultGetItemOptions)
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getItemsInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup) {
		return context.island.items.getItemsInContainerByGroup(container, itemTypeGroup, defaultGetItemOptions)
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getEquipmentItemsInInventory(context: Context) {
		return context.island.items.getItemsInContainer(context.human.inventory, defaultGetItemOptions)
			.filter(item => item.description?.equip !== undefined && this.isAllowedToUseEquipItem(context, item));
	}

	public getItemsInInventory(context: Context) {
		return this.getItemsInContainer(context, context.human.inventory);
	}

	public getItemInInventory(context: Context, itemTypeSearch: ItemType, options?: Partial<IGetItemOptions>): Item | undefined {
		return this.getItemInContainer(context, context.human.inventory, itemTypeSearch, options);
	}

	public getItemInContainer(context: Context, container: IContainer, itemTypeSearch: ItemType, options?: Partial<IGetItemOptions>): Item | undefined {
		const items = context.island.items.getItemsInContainer(container, defaultGetItemOptions);
		for (const item of items) {
			if (!options?.allowInventoryItems && this.isInventoryItem(context, item, options)) {
				continue;
			}

			if (!this.isAllowedToUseItem(context, item, false)) {
				continue;
			}

			if (item.type === itemTypeSearch) {
				if (context.isHardReservedItem(item)) {
					continue;
				}

				return item;
			}

			const description = itemDescriptions[item.type];
			if (description && description.weightCapacity !== undefined) {
				const item2 = this.getItemInContainer(context, item as IContainer, itemTypeSearch);
				if (item2) {
					return item2;
				}
			}
		}

		return undefined;
	}

	public getItemInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup, options?: Partial<IGetItemOptions>): Item | undefined {
		const items = context.island.items.getItemsInContainer(container, defaultGetItemOptions);
		for (const item of items) {
			if (!options?.allowInventoryItems && this.isInventoryItem(context, item, options)) {
				continue;
			}

			if (!this.isAllowedToUseItem(context, item, false)) {
				continue;
			}

			if (item.island.items.isInGroup(item.type, itemTypeGroup)) {
				if (context.isHardReservedItem(item)) {
					continue;
				}

				return item;
			}

			const description = itemDescriptions[item.type];
			if (description && description.weightCapacity !== undefined) {
				const item2 = this.getItemInContainerByGroup(context, item as IContainer, itemTypeGroup, options);
				if (item2) {
					return item2;
				}
			}
		}

		return undefined;
	}

	public isInventoryItem(context: Context, item: Item, options?: Partial<IGetItemOptions>) {
		for (const [key, inventoryItem] of Object.entries(context.inventory)) {
			if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
				if (key === "waterContainer" && options?.allowUnsafeWaterContainers) {
					return this.isSafeToDrinkItem(context, item);
				}

				return true;
			}
		}

		return false;
	}

	public canDestroyItem(context: Context, item: Item) {
		if (context.options.goodCitizen && multiplayer.isConnected() &&
			item.crafterIdentifier !== undefined && item.crafterIdentifier !== context.human.identifier) {
			// prevent destroying other peoples items
			return false;
		}

		return true;
	}

	public isSafeToDrinkItem(context: Context, item: Item) {
		return this.isSafeToDrinkItemType(context, item.type);
	}

	public isSafeToDrinkItemType(context: Context, itemType: ItemType) {
		return context.island.items.isInGroup(itemType, ItemTypeGroup.ContainerOfMedicinalWater) ||
			context.island.items.isInGroup(itemType, ItemTypeGroup.ContainerOfDesalinatedWater) ||
			context.island.items.isInGroup(itemType, ItemTypeGroup.ContainerOfPurifiedFreshWater) ||
			context.island.items.isInGroup(itemType, ItemTypeGroup.ContainerOfFilteredWater);
	}

	public isDrinkableItem(item: Item) {
		return this.hasUseActionType(item, ActionType.DrinkItem);
	}

	public canGatherWater(item: Item) {
		return this.hasUseActionType(item, ActionType.GatherLiquid);
	}

	public hasUseActionType(item: Item, actionType: ActionType) {
		return item.description?.use?.includes(actionType) ? true : false;
	}

	public getTools(context: Context, actionType: ActionType, preferredDamageType?: DamageType): Item[] {
		return this.getInventoryItemsWithUse(context, actionType)
			.filter(item => {
				const description = item.description;
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
		const description = doodad.description;
		if (!description) {
			return undefined;
		}

		let tool: Item | undefined;

		const stage = doodad.growth;
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
		const items = new Set(this.getEquipmentItemsInInventory(context)
			.filter(item => {
				if (item.type === ItemType.AnimalPelt) {
					// we're not savages
					return false;
				}

				const description = item.description;
				return description && description.equip === equip;
			}));

		const currentEquippedItem = context.human.getEquippedItem(equip);
		if (currentEquippedItem) {
			items.add(currentEquippedItem);
		}

		return Array.from(items)
			.sort((a, b) => {
				const result = this.calculateEquipItemScore(b) - this.calculateEquipItemScore(a);
				return result !== 0 ? result : (a.id - b.id); // ensure ties are broken deterministically
			});
	}

	public calculateEquipItemScore(item: Item): number {
		const description = item.description;
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

	public estimateWeaponDamage(context: Context, weapon: Item, target: Creature): number {
		let damageAmount = context.human.calculateDamageAmount(AttackType.MeleeWeapon, weapon);

		const damageType = weapon.description?.damageType;
		if (damageType !== undefined) {
			const attackOutcome = context.island.calculateDamageOutcome({
				human: context.human,
				target,
				damageAmount,
				damageType,
			})?.attackOutcome;
			if (attackOutcome !== undefined) {
				damageAmount = attackOutcome;
			}
		}

		return damageAmount;
	}

	public updateHandEquipment(context: Context, preferredDamageType?: DamageType): { equipType: EquipType; item: Item } | undefined {
		const mainHandEquipInterrupt = this.getDesiredEquipment(context, EquipType.MainHand, ActionType.Attack);
		if (mainHandEquipInterrupt) {
			return mainHandEquipInterrupt;
		}

		if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped(true)) {
			return {
				equipType: EquipType.OffHand,
				item: context.inventory.equipShield,
			};
		}
	}

	private getDesiredEquipment(context: Context, equipType: EquipType, use?: ActionType, itemTypes?: Array<ItemType | ItemTypeGroup>, preferredDamageType?: DamageType): { equipType: EquipType; item: Item } | undefined {
		const equippedItem = context.human.getEquippedItem(equipType);

		let possibleEquips: Item[];
		if (use) {
			possibleEquips = this.getPossibleHandEquips(context, use, preferredDamageType, false);

			if (use === ActionType.Attack) {
				// equip based on how effective it will be against nearby creatures
				let closestCreature: Creature | undefined;
				let closestCreatureDistance: number | undefined;

				for (let x = -2; x <= 2; x++) {
					for (let y = -2; y <= 2; y++) {
						const point = context.human.island.ensureValidPoint({ x: context.human.x + x, y: context.human.y + y, z: context.human.z });
						if (point) {
							const tile = context.island.getTileFromPoint(point);
							if (tile.creature && !tile.creature.isTamed()) {
								const distance = Vector2.squaredDistance(context.human, tile.creature.tile);
								if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
									closestCreatureDistance = distance;
									closestCreature = tile.creature;
								}
							}
						}
					}
				}

				if (closestCreature) {
					// creature is close, calculate it
					possibleEquips
						.sort((itemA, itemB) => {
							const damageA = this.estimateWeaponDamage(context, itemA, closestCreature!);
							const damageB = this.estimateWeaponDamage(context, itemB, closestCreature!);
							if (damageA !== damageB) {
								return damageB - damageA;
							}

							return (itemB.getItemUseBonus(use) - itemA.getItemUseBonus(use)) || (itemB.durability - itemA.durability);
						});

				} else if (context.human.getEquippedItem(equipType) !== undefined) {
					// don't switch until we're close to a creature
					return undefined;
				}
			}

			if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
				// fall back to not caring about the damage type
				possibleEquips = this.getPossibleHandEquips(context, use, undefined, false);
			}

		} else if (itemTypes) {
			possibleEquips = [];

			for (const itemType of itemTypes) {
				if (context.island.items.isGroup(itemType)) {
					possibleEquips.push(...context.utilities.item.getItemsInContainerByGroup(context, context.human.inventory, itemType));

				} else {
					possibleEquips.push(...context.utilities.item.getItemsInContainerByType(context, context.human.inventory, itemType));
				}
			}

		} else {
			return undefined;
		}

		if (possibleEquips.length > 0) {
			// always try to equip the two best items
			for (let i = 0; i < 2; i++) {
				const possibleEquipItem = possibleEquips[i];
				if (!possibleEquipItem || possibleEquipItem === equippedItem) {
					return undefined;
				}

				if (!possibleEquipItem.isEquipped(true)) {
					return {
						equipType,
						item: possibleEquips[i],
					};
				}
			}
		}

		return undefined;
	}

	public getPossibleHandEquips(context: Context, actionType: ActionType, preferredDamageType?: DamageType, filterEquipped?: boolean): Item[] {
		const items = this.getInventoryItemsWithUse(context, actionType, filterEquipped)
			.filter(item => {
				const description = item.description;
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
				const description = item.description;
				return description && description.equip === equipType;
			});
	}

	public getInventoryItemsWithUse(context: Context, use: ActionType, filterEquipped?: boolean): Item[] {
		return this.getItemsInInventory(context)
			.filter(item => {
				if (filterEquipped && item.isEquipped(true)) {
					return false;
				}

				const description = item.description;
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
					const descriptionA = a.description;
					const descriptionB = b.description;
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

				return a.durability !== undefined && b.durability !== undefined ? b.durability - a.durability : 0;
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
	 * Returns items to build items
	 * @param context Context
	 */
	public getItemsToBuild(context: Context) {
		const items: Item[] = [];

		for (const key of inventoryBuildItems) {
			const item = context.inventory[key] as Item | undefined;
			if (item && context.human.vehicleItemReference?.item !== item) {
				items.push(item);
			}
		}

		return items;
	}

	/**
	 * Returns unused items sorted by oldest to newest
	 */
	public getUnusedItems(context: Context, options: Partial<{ allowReservedItems: boolean }> = {}) {
		const items = this.getItemsInInventory(context);
		return items
			.filter(item => {
				if (item.isEquipped(true) ||
					this.isInventoryItem(context, item) ||
					(!options.allowReservedItems && context.isReservedItem(item))) {
					return false;
				}

				// const description = item.description;
				// if (description?.use && (description.use.includes(ActionType.GatherWater) || (description.use.includes(ActionType.DrinkItem) && !description.tier?.[ItemTypeGroup.FrozenWater]))) {
				// 	return false;
				// }

				return true;
			})
			.sort((a, b) => items.indexOf(a) - items.indexOf(b));
	}

	public getAvailableInventoryWeight(context: Context) {
		if (this.availableInventoryWeightCache === undefined) {
			const items = this.getItemsInInventory(context)
				.filter(item => this.isInventoryItem(context, item));
			const itemsWeight = items.reduce((total, b) => {
				const itemWeight = b.getTotalWeight(true);
				const weightReduction = b.getContainerWeightReduction();
				return total + (itemWeight * weightReduction);
			}, 0);
			this.availableInventoryWeightCache = context.human.stat.get<IStatMax>(Stat.Weight).max - itemsWeight;
		}

		return this.availableInventoryWeightCache;
	}

	public getSeeds(context: Context, onlyEdible: boolean): Item[] {
		const baseItems = this.getBaseItems(context);
		return baseItems.filter(
			item =>
				item.durability !== undefined &&
				item.durability > 0 &&
				(onlyEdible ? this.edibleSeedItemTypes : this.allSeedItemTypes).has(item.type)
		);
	}

	public getInventoryItemForDoodad(context: Context, doodadTypeOrGroup: DoodadType | DoodadTypeGroup): Item | undefined {
		const itemTypes: ItemType[] = [];

		const doodadTypes = context.utilities.doodad.getDoodadTypes(doodadTypeOrGroup);
		for (const dt of doodadTypes) {
			for (const it of Enums.values(ItemType)) {
				const itemDescription = itemDescriptions[it];
				if (itemDescription && itemDescription.onUse && itemDescription.onUse[ActionType.Build]?.type === dt) {
					itemTypes.push(it);
				}
			}
		}

		const matchingItems = this.getItemsInInventory(context).filter(item => itemTypes.includes(item.type));

		return matchingItems[0];
	}

	public getMoveItemToInventoryTarget(context: Context, item: Item): IContainer {
		if (context.options.allowBackpacks && !context.island.items.isContainer(item) && context.inventory.backpack?.length) {
			for (const backpack of context.inventory.backpack) {
				const backpackContainer = backpack as IContainer;
				if (context.island.items.hasRoomInContainer(backpackContainer, item)) {
					// move the item directly into the backpack
					return backpackContainer;
				}
			}
		}

		return context.human.inventory;
	}

	public getWaterContainers(context: Context) {
		const safeToDrinkWaterContainers: Item[] = [];
		const availableWaterContainers: Item[] = [];

		for (const waterContainer of context.inventory.waterContainer ?? []) {
			if (context.utilities.item.isSafeToDrinkItem(context, waterContainer)) {
				safeToDrinkWaterContainers.push(waterContainer);
			} else {
				availableWaterContainers.push(waterContainer);
			}
		}

		return { safeToDrinkWaterContainers, availableWaterContainers }
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
				if (this.isEdible(itemType)) {
					result.add(itemType);
				}
			}
		}

		return result;
	}

	/**
	 * Get a list of item types that are plantable and produce doodads with items that are healthy to eat
	 */
	private getSeedItemTypes(onlyEdible: boolean): Set<ItemType> {
		const result: Set<ItemType> = new Set();

		for (const itemType of Enums.values(ItemType)) {
			const description = itemDescriptions[itemType];
			const doodadType = description?.onUse?.[ActionType.Plant];
			if (doodadType === undefined) {
				continue;
			}

			const doodadDescription = doodadDescriptions[doodadType];

			if (!onlyEdible || (doodadDescription && this.producesEdibleItem(doodadDescription))) {
				result.add(itemType);
				continue
			}
		}

		return result;
	}

	private producesEdibleItem(doodadDescription: IDoodadDescription): boolean {
		const { gather, harvest } = doodadDescription;

		for (const growingStage of Enums.values(GrowingStage)) {
			const resourceItems = (gather?.[growingStage] ?? []).concat(harvest?.[growingStage] ?? []);
			for (const resourceItem of resourceItems) {
				if (this.isEdible(resourceItem.type)) {
					return true;
				}
			}
		}

		return false;
	}

	private isEdible(itemType: ItemType): boolean {
		const onEat = itemDescriptions[itemType]?.onUse?.[ActionType.Eat];
		return onEat !== undefined &&
			onEat[0] >= 1 && // hp. note: must be greater than or equal to 1 for Pemmican
			onEat[2] > 1; // hunger. don't continously dig for grass seeds
	}
}
