import type { DoodadType, DoodadTypeGroup, IDoodadDescription } from "game/doodad/IDoodad";
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
import { IDisassemblySearch } from "../core/ITars";
import ItemManager from "game/item/ItemManager";
import { ContextDataType } from "../core/context/IContext";
import { TarsUseProtectedItems } from "../core/ITarsOptions";
import Vector2 from "utilities/math/Vector2";

export class ItemUtilities {

	private static readonly relatedItemsCache: Map<ItemType, Set<ItemType>> = new Map();
	private static readonly relatedItemsByGroupCache: Map<ItemTypeGroup, Set<ItemType>> = new Map();
	private static readonly dismantleSearchCache: Map<ItemType, Set<ItemType>> = new Map();

	public foodItemTypes: Set<ItemType>;
	public allSeedItemTypes: Set<ItemType>;
	public edibleSeedItemTypes: Set<ItemType>;

	private availableInventoryWeightCache: number | undefined;
	private itemCache: Item[] | undefined;
	private readonly disassembleSearchCache: Map<ItemType, IDisassemblySearch[]> = new Map();

	/**
	 * All item types related to the provided one
	 */
	public static getRelatedItemTypes(itemType: ItemType): Set<ItemType> | boolean {
		let result = this.relatedItemsCache.get(itemType);
		if (result === undefined) {
			result = new Set();

			let queue: ItemType[] = [itemType];

			while (queue.length > 0) {
				const relatedItemType = queue.shift()!;

				if (result.has(relatedItemType)) {
					continue;
				}

				result.add(relatedItemType);

				const description = itemDescriptions[relatedItemType];
				if (!description) {
					continue;
				}

				const dismantleItems = description.dismantle?.items;
				if (dismantleItems) {
					queue.push(...dismantleItems.map(dismantleItem => dismantleItem.type));
				}

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

				queue.push(...Array.from(this.getDismantleSearch(relatedItemType)));
			}

			this.relatedItemsCache.set(itemType, result);
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
				const relatedItemTypes = this.getRelatedItemTypes(itemTypeForGroup);
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
	 * Items that can be dismantled to get the provided one
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
		this.itemCache = undefined;
		this.disassembleSearchCache.clear();
	}

	public getBaseItems(context: Context): Item[] {
		if (this.itemCache === undefined) {
			const baseTileItems = context.utilities.base.getTileItemsNearBase(context);
			const baseChestItems = context.base.chest
				.map(chest => this.getItemsInContainer(context, chest))
				.flat();
			const inventoryItems = this.getItemsInInventory(context);

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

			if (item.minDur !== undefined && item.minDur < 5) {
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

			if (item.minDur !== undefined && item.minDur < 5) {
				return false;
			}
		}

		return true;
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

	public getItemsInContainer(context: Context, container: IContainer) {
		return context.island.items.getItemsInContainer(container, { includeSubContainers: true })
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getItemsInContainerByType(context: Context, container: IContainer, itemType: ItemType) {
		return context.island.items.getItemsInContainerByType(container, itemType, { includeSubContainers: true })
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getItemsInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup) {
		return context.island.items.getItemsInContainerByGroup(container, itemTypeGroup, { includeSubContainers: true })
			.filter(item => this.isAllowedToUseItem(context, item));
	}

	public getEquipmentItemsInInventory(context: Context) {
		return context.island.items.getItemsInContainer(context.human.inventory, { includeSubContainers: true })
			.filter(item => item.description()?.equip !== undefined && this.isAllowedToUseEquipItem(context, item));
	}

	public getItemsInInventory(context: Context) {
		return this.getItemsInContainer(context, context.human.inventory);
	}

	public getItemInInventory(context: Context, itemTypeSearch: ItemType, allowInventoryItems: boolean = false): Item | undefined {
		return this.getItemInContainer(context, context.human.inventory, itemTypeSearch, allowInventoryItems);
	}

	public getItemInContainer(context: Context, container: IContainer, itemTypeSearch: ItemType, allowInventoryItems: boolean = false): Item | undefined {
		const orderedItems = context.island.items.getOrderedContainerItems(container);
		for (const item of orderedItems) {
			if (!allowInventoryItems && this.isInventoryItem(context, item)) {
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

			const description = Items[item.type];
			if (description && description.weightCapacity !== undefined) {
				const item2 = this.getItemInContainer(context, item as IContainer, itemTypeSearch);
				if (item2) {
					return item2;
				}
			}
		}

		return undefined;
	}

	public getItemInContainerByGroup(context: Context, container: IContainer, itemTypeGroup: ItemTypeGroup, allowInventoryItems: boolean = false): Item | undefined {
		const orderedItems = context.island.items.getOrderedContainerItems(container);
		for (const item of orderedItems) {
			if (!allowInventoryItems && this.isInventoryItem(context, item)) {
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

			const description = Items[item.type];
			if (description && description.weightCapacity !== undefined) {
				const item2 = this.getItemInContainerByGroup(context, item as IContainer, itemTypeGroup);
				if (item2) {
					return item2;
				}
			}
		}

		return undefined;
	}

	public isInventoryItem(context: Context, item: Item) {
		for (const [, inventoryItem] of Object.entries(context.inventory)) {
			if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
				return true;
			}
		}

		return false;
	}

	public canDestroyItem(context: Context, item: Item) {
		if (context.options.goodCitizen && multiplayer.isConnected() &&
			item.ownerIdentifier !== undefined && item.ownerIdentifier !== context.human.identifier) {
			// prevent destroying other peoples items
			return false;
		}

		return true;
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
		const items = new Set(this.getEquipmentItemsInInventory(context)
			.filter(item => {
				if (item.type === ItemType.AnimalPelt) {
					// we're not savages
					return false;
				}

				const description = item.description();
				return description && description.equip === equip;
			}));

		const currentEquippedItem = context.human.getEquippedItem(equip);
		if (currentEquippedItem) {
			items.add(currentEquippedItem);
		}

		return Array.from(items).sort((a, b) => this.calculateEquipItemScore(b) - this.calculateEquipItemScore(a));
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

	public updateHandEquipment(context: Context, preferredDamageType?: DamageType): { equipType: EquipType; item: Item } | undefined {
		const leftHandEquipInterrupt = this.getDesiredEquipment(context, EquipType.LeftHand, ActionType.Attack);
		if (leftHandEquipInterrupt) {
			return leftHandEquipInterrupt;
		}

		if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
			return {
				equipType: EquipType.RightHand,
				item: context.inventory.equipShield,
			};
		}

		const leftHandItem = context.human.getEquippedItem(EquipType.LeftHand);
		const rightHandItem = context.human.getEquippedItem(EquipType.RightHand);

		const leftHandDescription = leftHandItem ? leftHandItem.description() : undefined;
		const leftHandEquipped = leftHandDescription ? leftHandDescription.attack !== undefined : false;

		const rightHandDescription = rightHandItem ? rightHandItem.description() : undefined;
		const rightHandEquipped = rightHandDescription ? rightHandDescription.attack !== undefined : false;

		if (preferredDamageType !== undefined) {
			let leftHandDamageTypeMatches = false;
			if (leftHandEquipped) {
				const itemDescription = leftHandItem!.description();
				leftHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
			}

			let rightHandDamageTypeMatches = false;
			if (rightHandEquipped) {
				const itemDescription = rightHandItem!.description();
				rightHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
			}

			if (leftHandDamageTypeMatches || rightHandDamageTypeMatches) {
				if (leftHandDamageTypeMatches !== context.human.options.leftHand) {
					this.changeEquipmentOption(context, "leftHand");
				}

				if (rightHandDamageTypeMatches !== context.human.options.rightHand) {
					this.changeEquipmentOption(context, "rightHand");
				}

			} else if (leftHandEquipped || rightHandEquipped) {
				if (leftHandEquipped && !context.human.options.leftHand) {
					this.changeEquipmentOption(context, "leftHand");
				}

				if (rightHandEquipped && !context.human.options.rightHand) {
					this.changeEquipmentOption(context, "rightHand");
				}

			} else {
				if (!context.human.options.leftHand) {
					this.changeEquipmentOption(context, "leftHand");
				}

				if (!context.human.options.rightHand) {
					this.changeEquipmentOption(context, "rightHand");
				}
			}

		} else {
			if (!leftHandEquipped && !rightHandEquipped) {
				// if we have nothing equipped in both hands, make sure the left hand is enabled
				if (!context.human.options.leftHand) {
					this.changeEquipmentOption(context, "leftHand");
				}

			} else if (leftHandEquipped !== context.human.options.leftHand) {
				this.changeEquipmentOption(context, "leftHand");
			}

			if (leftHandEquipped) {
				// if we have the left hand equipped, disable right hand
				if (context.human.options.rightHand) {
					this.changeEquipmentOption(context, "rightHand");
				}

			} else if (rightHandEquipped !== context.human.options.rightHand) {
				this.changeEquipmentOption(context, "rightHand");
			}
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
								const distance = Vector2.squaredDistance(context.human, tile.creature.getPoint());
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
						.sort((a, b) => this.estimateDamageModifier(b, closestCreature!) - this.estimateDamageModifier(a, closestCreature!));

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

				if (!possibleEquipItem.isEquipped()) {
					return {
						equipType,
						item: possibleEquips[i],
					};
				}
			}
		}

		return undefined;
	}

	private changeEquipmentOption(context: Context, id: "leftHand" | "rightHand") {
		if (context.human.isLocalPlayer()) {
			oldui.changeEquipmentOption(id);

		} else if (!context.human.asPlayer) {
			const isLeftHand = id === "leftHand";
			const newValue = isLeftHand ? !context.human.options.leftHand : !context.human.options.rightHand;
			(context.human.options as any)[id] = newValue;

			// todo: mp somehow?
		}
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
		if (this.availableInventoryWeightCache === undefined) {
			const items = this.getItemsInInventory(context)
				.filter(item => this.isInventoryItem(context, item));
			const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
			this.availableInventoryWeightCache = context.human.stat.get<IStatMax>(Stat.Weight).max - itemsWeight;
		}

		return this.availableInventoryWeightCache;
	}

	public getSeeds(context: Context, onlyHealthy: boolean): Item[] {
		const baseItems = this.getBaseItems(context);
		return baseItems.filter(
			item =>
				item.minDur !== undefined &&
				item.minDur > 0 &&
				(onlyHealthy ? this.edibleSeedItemTypes : this.allSeedItemTypes).has(item.type)
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

		const matchingItems = this.getItemsInInventory(context).filter(item => itemTypes.includes(item.type));

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
	private getSeedItemTypes(onlyEdible: boolean): Set<ItemType> {
		const result: Set<ItemType> = new Set();

		for (const itemType of Enums.values(ItemType)) {
			const description = itemDescriptions[itemType];
			const doodadType = description?.onUse?.[ActionType.Plant];
			if (doodadType === undefined) {
				continue;
			}

			const doodadDescription = doodadDescriptions[doodadType];

			if (onlyEdible || (doodadDescription && this.producesEdibleItem(doodadDescription))) {
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
				if (this.isHealthyToEat(resourceItem.type)) {
					return true;
				}
			}
		}

		return false;
	}

	private isHealthyToEat(itemType: ItemType): boolean {
		const onEat = itemDescriptions[itemType]?.onUse?.[ActionType.Eat];
		return onEat !== undefined && onEat[0] > 1;
	}
}
