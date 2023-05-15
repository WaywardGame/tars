/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/entity/action/IAction", "game/item/IItem", "game/item/ItemDescriptions", "game/item/ItemRecipeRequirementChecker", "game/tile/Terrains", "utilities/enum/Enums", "game/item/ItemManager", "utilities/math/Vector2", "../core/ITars", "../core/ITarsOptions", "../core/context/IContext"], function (require, exports, Doodads_1, IDoodad_1, IEntity_1, IHuman_1, IStats_1, IAction_1, IItem_1, ItemDescriptions_1, ItemRecipeRequirementChecker_1, Terrains_1, Enums_1, ItemManager_1, Vector2_1, ITars_1, ITarsOptions_1, IContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemUtilities = exports.RelatedItemType = exports.defaultGetItemOptions = void 0;
    exports.defaultGetItemOptions = { includeSubContainers: true };
    var RelatedItemType;
    (function (RelatedItemType) {
        RelatedItemType[RelatedItemType["All"] = 0] = "All";
        RelatedItemType[RelatedItemType["Recipe"] = 1] = "Recipe";
        RelatedItemType[RelatedItemType["Disassemble"] = 2] = "Disassemble";
        RelatedItemType[RelatedItemType["Dismantle"] = 3] = "Dismantle";
    })(RelatedItemType = exports.RelatedItemType || (exports.RelatedItemType = {}));
    class ItemUtilities {
        constructor() {
            this.groundItemCache = new Map();
            this.disassembleSearchCache = new Map();
        }
        static getRelatedItemTypes(itemType, relatedItemType) {
            const cacheId = `${itemType},${relatedItemType}`;
            let result = this.relatedItemsCache.get(cacheId);
            if (result === undefined) {
                result = new Set();
                let queue = [itemType];
                while (queue.length > 0) {
                    const otherItemType = queue.shift();
                    if (result.has(otherItemType)) {
                        continue;
                    }
                    result.add(otherItemType);
                    const description = ItemDescriptions_1.itemDescriptions[otherItemType];
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
                                if (ItemManager_1.default.isGroup(recipe.baseComponent)) {
                                    queue.push(...Array.from(ItemManager_1.default.getGroupItems(recipe.baseComponent)));
                                }
                                else {
                                    queue.push(recipe.baseComponent);
                                }
                            }
                            for (const component of recipe.components) {
                                if (ItemManager_1.default.isGroup(component.type)) {
                                    queue.push(...Array.from(ItemManager_1.default.getGroupItems(component.type)));
                                }
                                else {
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
        static getRelatedItemTypesByGroup(itemTypeGroup) {
            let result = this.relatedItemsByGroupCache.get(itemTypeGroup);
            if (result === undefined) {
                result = new Set();
                for (const itemTypeForGroup of ItemManager_1.default.getGroupItems(itemTypeGroup)) {
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
        static getDismantleSearch(itemType) {
            let search = this.dismantleSearchCache.get(itemType);
            if (search === undefined) {
                search = new Set();
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = ItemDescriptions_1.itemDescriptions[it];
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
        initialize(context) {
            this.foodItemTypes = this.getFoodItemTypes();
            this.allSeedItemTypes = this.getSeedItemTypes(false);
            this.edibleSeedItemTypes = this.getSeedItemTypes(true);
        }
        clearCache() {
            this.availableInventoryWeightCache = undefined;
            this.baseItemCache = undefined;
            this.baseTileItemCache = undefined;
            this.groundItemCache.clear();
            this.disassembleSearchCache.clear();
        }
        getBaseItems(context) {
            if (this.baseItemCache === undefined) {
                const baseTileItems = Array.from(this.getBaseTileItems(context));
                const baseChestItems = context.base.chest
                    .map(chest => this.getItemsInContainer(context, chest))
                    .flat();
                const inventoryItems = this.getItemsInInventory(context);
                this.baseItemCache = baseTileItems
                    .concat(baseChestItems)
                    .concat(inventoryItems);
            }
            return this.baseItemCache;
        }
        getBaseTileItems(context) {
            if (this.baseTileItemCache === undefined) {
                this.baseTileItemCache = new Set(context.utilities.base.getTileItemsNearBase(context));
            }
            return this.baseTileItemCache;
        }
        getBaseItemsByType(context, itemType) {
            return this.getBaseItems(context).filter(item => item.type === itemType);
        }
        getGroundItems(context, itemType) {
            let cachedItems = this.groundItemCache.get(itemType);
            if (cachedItems === undefined) {
                cachedItems = context.island.items.getObjects()
                    .filter((item) => item !== undefined &&
                    item.type === itemType &&
                    context.island.items.isTileContainer(item.containedWithin));
                if (cachedItems.length > 500) {
                    cachedItems = cachedItems.slice(0, 500);
                }
                this.groundItemCache.set(itemType, cachedItems);
            }
            return cachedItems;
        }
        getDisassembleSearch(context, itemType) {
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
        isAllowedToUseItem(context, item, allowProtectedInventoryItems = true) {
            if (context.options.useProtectedItems !== ITarsOptions_1.TarsUseProtectedItems.Yes && item.isProtected()) {
                if (allowProtectedInventoryItems && this.isInventoryItem(context, item)) {
                    return true;
                }
                if (context.options.useProtectedItems === ITarsOptions_1.TarsUseProtectedItems.No) {
                    return false;
                }
                if (item.durability !== undefined && item.durability < 5) {
                    return false;
                }
            }
            return true;
        }
        isAllowedToUseEquipItem(context, item) {
            if (context.options.useProtectedItems !== ITarsOptions_1.TarsUseProtectedItems.Yes && item.isProtected()) {
                if (this.isInventoryItem(context, item)) {
                    return true;
                }
                if (context.options.useProtectedItems === ITarsOptions_1.TarsUseProtectedItems.No && !context.options.useProtectedItemsForEquipment) {
                    return false;
                }
                if (item.durability !== undefined && item.durability < 5) {
                    return false;
                }
            }
            return true;
        }
        processRecipe(context, recipe, useIntermediateChest, options) {
            const checker = new ItemRecipeRequirementChecker_1.default(context.human, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
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
            const items = this.getItemsInInventory(context)
                .slice()
                .sort((a, b) => {
                return a === context.inventory.knife ? -1 : 1;
            });
            const container = {
                containedItems: items,
                itemOrders: items.map(i => i.id),
            };
            checker.processContainer(container);
            if (useIntermediateChest && context.base.intermediateChest[0] && !checker.requirementsMet()) {
                checker.processContainer(context.base.intermediateChest[0]);
            }
            return checker;
        }
        getItemsInContainer(context, container) {
            return context.island.items.getItemsInContainer(container, exports.defaultGetItemOptions)
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getItemsInContainerByType(context, container, itemType) {
            return context.island.items.getItemsInContainerByType(container, itemType, exports.defaultGetItemOptions)
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getItemsInContainerByGroup(context, container, itemTypeGroup) {
            return context.island.items.getItemsInContainerByGroup(container, itemTypeGroup, exports.defaultGetItemOptions)
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getEquipmentItemsInInventory(context) {
            return context.island.items.getItemsInContainer(context.human.inventory, exports.defaultGetItemOptions)
                .filter(item => item.description?.equip !== undefined && this.isAllowedToUseEquipItem(context, item));
        }
        getItemsInInventory(context) {
            return this.getItemsInContainer(context, context.human.inventory);
        }
        getItemInInventory(context, itemTypeSearch, options) {
            return this.getItemInContainer(context, context.human.inventory, itemTypeSearch, options);
        }
        getItemInContainer(context, container, itemTypeSearch, options) {
            const items = context.island.items.getItemsInContainer(container, exports.defaultGetItemOptions);
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
                const description = ItemDescriptions_1.itemDescriptions[item.type];
                if (description && description.weightCapacity !== undefined) {
                    const item2 = this.getItemInContainer(context, item, itemTypeSearch);
                    if (item2) {
                        return item2;
                    }
                }
            }
            return undefined;
        }
        getItemInContainerByGroup(context, container, itemTypeGroup, options) {
            const items = context.island.items.getItemsInContainer(container, exports.defaultGetItemOptions);
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
                const description = ItemDescriptions_1.itemDescriptions[item.type];
                if (description && description.weightCapacity !== undefined) {
                    const item2 = this.getItemInContainerByGroup(context, item, itemTypeGroup, options);
                    if (item2) {
                        return item2;
                    }
                }
            }
            return undefined;
        }
        isInventoryItem(context, item, options) {
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
        canDestroyItem(context, item) {
            if (context.options.goodCitizen && multiplayer.isConnected() &&
                item.crafterIdentifier !== undefined && item.crafterIdentifier !== context.human.identifier) {
                return false;
            }
            return true;
        }
        isSafeToDrinkItem(context, item) {
            return this.isSafeToDrinkItemType(context, item.type);
        }
        isSafeToDrinkItemType(context, itemType) {
            return context.island.items.isInGroup(itemType, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater) ||
                context.island.items.isInGroup(itemType, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater) ||
                context.island.items.isInGroup(itemType, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater) ||
                context.island.items.isInGroup(itemType, IItem_1.ItemTypeGroup.ContainerOfFilteredWater);
        }
        isDrinkableItem(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.DrinkItem);
        }
        canGatherWater(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.GatherLiquid);
        }
        hasUseActionType(item, actionType) {
            return item.description?.use?.includes(actionType) ? true : false;
        }
        getTools(context, actionType, preferredDamageType) {
            return this.getInventoryItemsWithUse(context, actionType)
                .filter(item => {
                const description = item.description;
                return description && (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
            })
                .sort((itemA, itemB) => itemB.getItemUseBonus(actionType) - itemA.getItemUseBonus(actionType));
        }
        getBestTool(context, use, preferredDamageType) {
            let possibleEquips = this.getTools(context, use, preferredDamageType);
            if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                possibleEquips = this.getTools(context, use);
            }
            return possibleEquips.length > 0 ? possibleEquips[0] : undefined;
        }
        getBestToolForDoodadGather(context, doodad) {
            const description = doodad.description;
            if (!description) {
                return undefined;
            }
            let tool;
            const stage = doodad.growth;
            if (stage !== undefined && description.harvest && description.harvest[stage]) {
                tool = this.getBestTool(context, IAction_1.ActionType.Harvest);
            }
            else {
                const skillType = description.gatherSkillUse ?? description.skillUse;
                tool = this.getBestTool(context, skillType === IHuman_1.SkillType.Lumberjacking ? IAction_1.ActionType.Chop : IAction_1.ActionType.Mine);
            }
            return tool;
        }
        getBestToolForTerrainGather(context, terrainType) {
            const terrainDescription = Terrains_1.terrainDescriptions[terrainType];
            if (!terrainDescription) {
                return undefined;
            }
            let tool;
            if (terrainDescription.gather) {
                const prefersBlunt = (terrainDescription.gatherSkillUse ?? IHuman_1.SkillType.Mining) === IHuman_1.SkillType.Mining;
                tool = this.getBestTool(context, IAction_1.ActionType.Mine, prefersBlunt ? IEntity_1.DamageType.Blunt : IEntity_1.DamageType.Slashing);
            }
            else {
                tool = this.getBestTool(context, IAction_1.ActionType.Dig);
            }
            return tool;
        }
        getBestEquipment(context, equip) {
            const items = new Set(this.getEquipmentItemsInInventory(context)
                .filter(item => {
                if (item.type === IItem_1.ItemType.AnimalPelt) {
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
                return result !== 0 ? result : (a.id - b.id);
            });
        }
        calculateEquipItemScore(item) {
            const description = item.description;
            if (!description || !description.defense) {
                return 0;
            }
            let score = 4 * description.defense.base;
            const resists = description.defense.resist;
            const vulns = description.defense.vulnerable;
            for (const damageType of Enums_1.default.values(IEntity_1.DamageType)) {
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
        estimateWeaponDamage(context, weapon, target) {
            let damageAmount = context.human.calculateDamageAmount(IEntity_1.AttackType.MeleeWeapon, weapon);
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
        updateHandEquipment(context, preferredDamageType) {
            const mainHandEquipInterrupt = this.getDesiredEquipment(context, IHuman_1.EquipType.MainHand, IAction_1.ActionType.Attack);
            if (mainHandEquipInterrupt) {
                return mainHandEquipInterrupt;
            }
            if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped(true)) {
                return {
                    equipType: IHuman_1.EquipType.OffHand,
                    item: context.inventory.equipShield,
                };
            }
        }
        getDesiredEquipment(context, equipType, use, itemTypes, preferredDamageType) {
            const equippedItem = context.human.getEquippedItem(equipType);
            let possibleEquips;
            if (use) {
                possibleEquips = this.getPossibleHandEquips(context, use, preferredDamageType, false);
                if (use === IAction_1.ActionType.Attack) {
                    let closestCreature;
                    let closestCreatureDistance;
                    for (let x = -2; x <= 2; x++) {
                        for (let y = -2; y <= 2; y++) {
                            const tile = context.human.island.getTileSafe(context.human.x + x, context.human.y + y, context.human.z);
                            if (tile?.creature && !tile.creature.isTamed()) {
                                const distance = Vector2_1.default.squaredDistance(context.human, tile.creature.tile);
                                if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
                                    closestCreatureDistance = distance;
                                    closestCreature = tile.creature;
                                }
                            }
                        }
                    }
                    if (closestCreature) {
                        possibleEquips
                            .sort((itemA, itemB) => {
                            const damageA = this.estimateWeaponDamage(context, itemA, closestCreature);
                            const damageB = this.estimateWeaponDamage(context, itemB, closestCreature);
                            if (damageA !== damageB) {
                                return damageB - damageA;
                            }
                            return (itemB.getItemUseBonus(use) - itemA.getItemUseBonus(use)) || (itemB.durability - itemA.durability);
                        });
                    }
                    else if (context.human.getEquippedItem(equipType) !== undefined) {
                        return undefined;
                    }
                }
                if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                    possibleEquips = this.getPossibleHandEquips(context, use, undefined, false);
                }
            }
            else if (itemTypes) {
                possibleEquips = [];
                for (const itemType of itemTypes) {
                    if (context.island.items.isGroup(itemType)) {
                        possibleEquips.push(...context.utilities.item.getItemsInContainerByGroup(context, context.human.inventory, itemType));
                    }
                    else {
                        possibleEquips.push(...context.utilities.item.getItemsInContainerByType(context, context.human.inventory, itemType));
                    }
                }
            }
            else {
                return undefined;
            }
            if (possibleEquips.length > 0) {
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
        getPossibleHandEquips(context, actionType, preferredDamageType, filterEquipped) {
            const items = this.getInventoryItemsWithUse(context, actionType, filterEquipped)
                .filter(item => {
                const description = item.description;
                return description && description.equip === IHuman_1.EquipType.Held &&
                    (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
            });
            if (actionType !== IAction_1.ActionType.Attack) {
                return items.sort((itemA, itemB) => itemB.getItemUseBonus(actionType) - itemA.getItemUseBonus(actionType));
            }
            return items;
        }
        getInventoryItemsWithEquipType(context, equipType) {
            return this.getItemsInInventory(context)
                .filter(item => {
                const description = item.description;
                return description && description.equip === equipType;
            });
        }
        getInventoryItemsWithUse(context, use, filterEquipped) {
            return this.getItemsInInventory(context)
                .filter(item => {
                if (filterEquipped && item.isEquipped(true)) {
                    return false;
                }
                const description = item.description;
                if (!description) {
                    return false;
                }
                if (use === IAction_1.ActionType.Attack) {
                    return description.attack !== undefined;
                }
                return description.use && description.use.includes(use);
            })
                .sort((a, b) => {
                if (use === IAction_1.ActionType.Attack) {
                    const descriptionA = a.description;
                    const descriptionB = b.description;
                    if (descriptionA !== undefined && descriptionB !== undefined &&
                        descriptionA.attack !== undefined && descriptionB.attack !== undefined &&
                        descriptionA.damageType !== undefined && descriptionB.damageType !== undefined) {
                        if (descriptionA.attack === descriptionB.attack) {
                            const damageTypesA = Enums_1.default.values(IEntity_1.DamageType).filter(type => (descriptionA.damageType & type) === type).length;
                            const damageTypesB = Enums_1.default.values(IEntity_1.DamageType).filter(type => (descriptionB.damageType & type) === type).length;
                            return damageTypesB - damageTypesA;
                        }
                        return descriptionB.attack - descriptionA.attack;
                    }
                }
                return a.durability !== undefined && b.durability !== undefined ? b.durability - a.durability : 0;
            });
        }
        getReservedItems(context, includeKeepInInventoryItems) {
            const keepInInventoryItems = context.getDataOrDefault(IContext_1.ContextDataType.KeepInInventoryItems, new Set());
            let reservedItems = this.getItemsInInventory(context)
                .filter(item => context.isHardReservedItem(item) && !this.isInventoryItem(context, item));
            if (!includeKeepInInventoryItems) {
                reservedItems = reservedItems.filter(item => !keepInInventoryItems.has(item));
            }
            return reservedItems;
        }
        getItemsToBuild(context) {
            const items = [];
            for (const key of ITars_1.inventoryBuildItems) {
                const item = context.inventory[key];
                if (item && context.human.vehicleItemReference?.item !== item) {
                    items.push(item);
                }
            }
            return items;
        }
        getUnusedItems(context, options = {}) {
            const items = this.getItemsInInventory(context);
            return items
                .filter(item => {
                if (item.isEquipped(true) ||
                    this.isInventoryItem(context, item) ||
                    (!options.allowReservedItems && context.isReservedItem(item))) {
                    return false;
                }
                return true;
            })
                .sort((a, b) => items.indexOf(a) - items.indexOf(b));
        }
        getAvailableInventoryWeight(context) {
            if (this.availableInventoryWeightCache === undefined) {
                const items = this.getItemsInInventory(context)
                    .filter(item => this.isInventoryItem(context, item));
                const itemsWeight = items.reduce((total, b) => {
                    const itemWeight = b.getTotalWeight(true);
                    const weightReduction = b.getContainerWeightReduction();
                    return total + (itemWeight * weightReduction);
                }, 0);
                this.availableInventoryWeightCache = context.human.stat.get(IStats_1.Stat.Weight).max - itemsWeight;
            }
            return this.availableInventoryWeightCache;
        }
        getSeeds(context, onlyEdible) {
            const baseItems = this.getBaseItems(context);
            return baseItems.filter(item => item.durability !== undefined &&
                item.durability > 0 &&
                (onlyEdible ? this.edibleSeedItemTypes : this.allSeedItemTypes).has(item.type));
        }
        getInventoryItemForDoodad(context, doodadTypeOrGroup) {
            const itemTypes = [];
            const doodadTypes = context.utilities.doodad.getDoodadTypes(doodadTypeOrGroup);
            for (const dt of doodadTypes) {
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const itemDescription = ItemDescriptions_1.itemDescriptions[it];
                    if (itemDescription && itemDescription.onUse && itemDescription.onUse[IAction_1.ActionType.Build]?.type === dt) {
                        itemTypes.push(it);
                    }
                }
            }
            const matchingItems = this.getItemsInInventory(context).filter(item => itemTypes.includes(item.type));
            return matchingItems[0];
        }
        getMoveItemToInventoryTarget(context, item) {
            if (context.options.allowBackpacks && !context.island.items.isContainer(item) && context.inventory.backpack?.length) {
                for (const backpack of context.inventory.backpack) {
                    const backpackContainer = backpack;
                    if (context.island.items.hasRoomInContainer(backpackContainer, item)) {
                        return backpackContainer;
                    }
                }
            }
            return context.human.inventory;
        }
        getWaterContainers(context) {
            const safeToDrinkWaterContainers = [];
            const availableWaterContainers = [];
            for (const waterContainer of context.inventory.waterContainer ?? []) {
                if (context.utilities.item.isSafeToDrinkItem(context, waterContainer)) {
                    safeToDrinkWaterContainers.push(waterContainer);
                }
                else {
                    availableWaterContainers.push(waterContainer);
                }
            }
            return { safeToDrinkWaterContainers, availableWaterContainers };
        }
        getFoodItemTypes() {
            const result = new Set();
            const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
            for (const itemTypeOrGroup of goodFoodItems) {
                const itemTypes = ItemManager_1.default.isGroup(itemTypeOrGroup) ? ItemManager_1.default.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
                for (const itemType of itemTypes) {
                    if (this.isEdible(itemType)) {
                        result.add(itemType);
                    }
                }
            }
            return result;
        }
        getSeedItemTypes(onlyEdible) {
            const result = new Set();
            for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                const description = ItemDescriptions_1.itemDescriptions[itemType];
                const doodadType = description?.onUse?.[IAction_1.ActionType.Plant];
                if (doodadType === undefined) {
                    continue;
                }
                const doodadDescription = Doodads_1.doodadDescriptions[doodadType];
                if (!onlyEdible || (doodadDescription && this.producesEdibleItem(doodadDescription))) {
                    result.add(itemType);
                    continue;
                }
            }
            return result;
        }
        producesEdibleItem(doodadDescription) {
            const { gather, harvest } = doodadDescription;
            for (const growingStage of Enums_1.default.values(IDoodad_1.GrowingStage)) {
                const resourceItems = (gather?.[growingStage] ?? []).concat(harvest?.[growingStage] ?? []);
                for (const resourceItem of resourceItems) {
                    if (this.isEdible(resourceItem.type)) {
                        return true;
                    }
                }
            }
            return false;
        }
        isEdible(itemType) {
            const onEat = IItem_1.ConsumeItemStats.resolve(ItemDescriptions_1.itemDescriptions[itemType]?.onUse?.[IAction_1.ActionType.Eat]);
            return (onEat.get(IStats_1.Stat.Health) ?? 0) >= 1 &&
                (onEat.get(IStats_1.Stat.Hunger) ?? 0) > 1;
        }
    }
    ItemUtilities.relatedItemsCache = new Map();
    ItemUtilities.relatedItemsByGroupCache = new Map();
    ItemUtilities.dismantleSearchCache = new Map();
    exports.ItemUtilities = ItemUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBNkJVLFFBQUEscUJBQXFCLEdBQXdDLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFFekcsSUFBWSxlQUtYO0lBTEQsV0FBWSxlQUFlO1FBQzFCLG1EQUFHLENBQUE7UUFDSCx5REFBTSxDQUFBO1FBQ04sbUVBQVcsQ0FBQTtRQUNYLCtEQUFTLENBQUE7SUFDVixDQUFDLEVBTFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFLMUI7SUFRRCxNQUFhLGFBQWE7UUFBMUI7WUFla0Isb0JBQWUsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNuRCwyQkFBc0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQSs0QjFGLENBQUM7UUExNEJPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFrQixFQUFFLGVBQWdDO1lBQ3JGLE1BQU0sT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ2pELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFbkIsSUFBSSxLQUFLLEdBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbkMsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRyxDQUFDO29CQUVyQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQzlCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxh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