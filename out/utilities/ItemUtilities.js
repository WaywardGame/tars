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
define(["require", "exports", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/IEntity", "@wayward/game/game/entity/IHuman", "@wayward/game/game/entity/IStats", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/game/item/ItemRecipeRequirementChecker", "@wayward/game/game/tile/Terrains", "@wayward/game/utilities/enum/Enums", "@wayward/game/game/item/ItemManager", "@wayward/game/utilities/math/Vector2", "../core/ITars", "../core/ITarsOptions", "../core/context/IContext"], function (require, exports, Doodads_1, IDoodad_1, IEntity_1, IHuman_1, IStats_1, IAction_1, IItem_1, ItemDescriptions_1, ItemRecipeRequirementChecker_1, Terrains_1, Enums_1, ItemManager_1, Vector2_1, ITars_1, ITarsOptions_1, IContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemUtilities = exports.RelatedItemType = exports.defaultGetItemOptions = void 0;
    const groundItemLimit = 500;
    const disassembleItemLimit = 50;
    exports.defaultGetItemOptions = { includeSubContainers: true };
    var RelatedItemType;
    (function (RelatedItemType) {
        RelatedItemType[RelatedItemType["All"] = 0] = "All";
        RelatedItemType[RelatedItemType["Recipe"] = 1] = "Recipe";
        RelatedItemType[RelatedItemType["Disassemble"] = 2] = "Disassemble";
        RelatedItemType[RelatedItemType["Dismantle"] = 3] = "Dismantle";
    })(RelatedItemType || (exports.RelatedItemType = RelatedItemType = {}));
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
                if (context.options.limitGroundItemSearch && cachedItems.length > groundItemLimit) {
                    cachedItems = cachedItems.slice(0, groundItemLimit);
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
                    if (context.options.limitDisassembleItemSearch && search.length >= disassembleItemLimit) {
                        break;
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
                addOrder: items.map(i => i.id),
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
            if (context.options.goodCitizen && multiplayer.isConnected &&
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
                            if (tile?.creature && !tile.creature.isTamed) {
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
    exports.ItemUtilities = ItemUtilities;
    ItemUtilities.relatedItemsCache = new Map();
    ItemUtilities.relatedItemsByGroupCache = new Map();
    ItemUtilities.dismantleSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbVV0aWxpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbVV0aWxpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7O0lBOEJILE1BQU0sZUFBZSxHQUFHLEdBQUcsQ0FBQztJQUc1QixNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztJQUVuQixRQUFBLHFCQUFxQixHQUF3QyxFQUFFLG9CQUFvQixFQUFFLElBQUksRUFBRSxDQUFDO0lBRXpHLElBQVksZUFLWDtJQUxELFdBQVksZUFBZTtRQUMxQixtREFBRyxDQUFBO1FBQ0gseURBQU0sQ0FBQTtRQUNOLG1FQUFXLENBQUE7UUFDWCwrREFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUxXLGVBQWUsK0JBQWYsZUFBZSxRQUsxQjtJQVFELE1BQWEsYUFBYTtRQUExQjtZQWVrQixvQkFBZSxHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ25ELDJCQUFzQixHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBbzVCMUYsQ0FBQztRQS80Qk8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQWtCLEVBQUUsZUFBZ0M7WUFDckYsTUFBTSxPQUFPLEdBQUcsR0FBRyxRQUFRLElBQUksZUFBZSxFQUFFLENBQUM7WUFDakQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRW5CLElBQUksS0FBSyxHQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRW5DLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDekIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRyxDQUFDO29CQUVyQyxJQUFJ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