define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/tile/Terrains", "game/item/ItemDescriptions", "game/item/ItemRecipeRequirementChecker", "utilities/enum/Enums", "game/item/ItemManager", "utilities/math/Vector2", "../core/context/IContext", "../core/ITars", "../core/ITarsOptions"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, Terrains_1, ItemDescriptions_1, ItemRecipeRequirementChecker_1, Enums_1, ItemManager_1, Vector2_1, IContext_1, ITars_1, ITarsOptions_1) {
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
            const onEat = ItemDescriptions_1.itemDescriptions[itemType]?.onUse?.[IAction_1.ActionType.Eat];
            return onEat !== undefined &&
                onEat[0] >= 1 &&
                onEat[2] > 1;
        }
    }
    ItemUtilities.relatedItemsCache = new Map();
    ItemUtilities.relatedItemsByGroupCache = new Map();
    ItemUtilities.dismantleSearchCache = new Map();
    exports.ItemUtilities = ItemUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBNEJhLFFBQUEscUJBQXFCLEdBQXdDLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFFekcsSUFBWSxlQUtYO0lBTEQsV0FBWSxlQUFlO1FBQzFCLG1EQUFHLENBQUE7UUFDSCx5REFBTSxDQUFBO1FBQ04sbUVBQVcsQ0FBQTtRQUNYLCtEQUFTLENBQUE7SUFDVixDQUFDLEVBTFcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFLMUI7SUFRRCxNQUFhLGFBQWE7UUFBMUI7WUFla0Isb0JBQWUsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNuRCwyQkFBc0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTI0QjFGLENBQUM7UUF0NEJPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFrQixFQUFFLGVBQWdDO1lBQ3JGLE1BQU0sT0FBTyxHQUFHLEdBQUcsUUFBUSxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ2pELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFbkIsSUFBSSxLQUFLLEdBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbkMsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRyxDQUFDO29CQUVyQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7d0JBQzlCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFFMUIsTUFBTSxXQUFXLEdBQUcsbUNBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3BELElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2pCLFNBQVM7cUJBQ1Q7b0JBRUQsSUFBSSxlQUFlLEtBQUssZUFBZSxDQUFDLEdBQUcsSUFBSSxlQUFlLEtBQUssZUFBZSxDQUFDLFNBQVMsSUFBSSxhQUFhLEtBQUssUUFBUSxFQUFFO3dCQUMzSCxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQzt3QkFDcEQsSUFBSSxjQUFjLEVBQUU7NEJBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7eUJBQ3ZFO3FCQUNEO29CQUVELElBQUksZUFBZSxLQUFLLGVBQWUsQ0FBQyxHQUFHLElBQUksZUFBZSxLQUFLLGVBQWUsQ0FBQyxNQUFNLElBQUksYUFBYSxLQUFLLFFBQVEsRUFBRTt3QkFDeEgsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQzt3QkFDbEMsSUFBSSxNQUFNLEVBQUU7NEJBQ1gsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO2dDQUN6QixJQUFJLHFCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRTtvQ0FDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMscUJBQVcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQ0FFM0U7cUNBQU07b0NBQ04sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7aUNBQ2pDOzZCQUNEOzRCQUVELEtBQUssTUFBTSxTQUFTLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtnQ0FDMUMsSUFBSSxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7b0NBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFXLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUNBRXJFO3FDQUFNO29DQUNOLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2lDQUMzQjs2QkFDRDt5QkFDRDtxQkFDRDtvQkFFRCxJQUFJLGVBQWUsS0FBSyxlQUFlLENBQUMsR0FBRyxJQUFJLGVBQWUsS0FBSyxlQUFlLENBQUMsU0FBUyxJQUFJLGFBQWEsS0FBSyxRQUFRLEVBQUU7d0JBQzNILEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2xFO2lCQUNEO2dCQUVELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQzVDO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBS00sTUFBTSxDQUFDLDBCQUEwQixDQUFDLGFBQTRCO1lBQ3BFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFbkIsS0FBSyxNQUFNLGdCQUFnQixJQUFJLHFCQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFO29CQUN4RSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pGLElBQUksZ0JBQWdCLFlBQVksR0FBRyxFQUFFO3dCQUNwQyxLQUFLLE1BQU0sUUFBUSxJQUFJLGdCQUFnQixFQUFFOzRCQUN4QyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3lCQUNyQjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUN6RDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUtNLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFrQjtZQUNsRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRW5CLEtBQUssTUFBTSxFQUFFLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLEVBQUU7b0JBQ3hDLE1BQU0sV0FBVyxHQUFHLG1DQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsU0FBUyxFQUFFO3dCQUN6QyxLQUFLLE1BQU0sRUFBRSxJQUFJLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFOzRCQUM3QyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dDQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dDQUNmLE1BQU07NkJBQ047eUJBQ0Q7cUJBQ0Q7aUJBQ0Q7Z0JBRUQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDaEQ7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNmLENBQUM7UUFFTSxVQUFVLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM3QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVNLFVBQVU7WUFDaEIsSUFBSSxDQUFDLDZCQUE2QixHQUFHLFNBQVMsQ0FBQztZQUMvQyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztZQUMvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO1lBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLENBQUM7UUFFTSxZQUFZLENBQUMsT0FBZ0I7WUFDbkMsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsRUFBRTtnQkFDckMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDakUsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLO3FCQUN2QyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQW1CLENBQUMsQ0FBQztxQkFDcEUsSUFBSSxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV6RCxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWE7cUJBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUM7cUJBQ3RCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUN6QjtZQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUMzQixDQUFDO1FBRU0sZ0JBQWdCLENBQUMsT0FBZ0I7WUFDdkMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUN2RjtZQUVELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1FBQy9CLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxPQUFnQixFQUFFLFFBQWtCO1lBQzdELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFTSxjQUFjLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjtZQUN6RCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyRCxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7cUJBQzdDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQ2hCLElBQUksS0FBSyxTQUFTO29CQUNsQixJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVE7b0JBQ3RCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQVcsQ0FBQztnQkFDeEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsT0FBTyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUVNLG9CQUFvQixDQUFDLE9BQWdCLEVBQUUsUUFBa0I7WUFDL0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2RCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLE1BQU0sR0FBRyxFQUFFLENBQUM7Z0JBRVosS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUM5QyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDdEIsU0FBUztxQkFDVDtvQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNyQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRTt3QkFDN0MsU0FBUztxQkFDVDtvQkFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO29CQUNyRCxJQUFJLENBQUMsaUJBQWlCLEVBQUU7d0JBQ3ZCLFNBQVM7cUJBQ1Q7b0JBRUQsS0FBSyxNQUFNLGVBQWUsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEVBQUU7d0JBQ3RELElBQUksZUFBZSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7NEJBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0NBQ1gsSUFBSTtnQ0FDSixnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxLQUFLO2dDQUN6QyxzQkFBc0IsRUFBRSxXQUFXLENBQUMsc0JBQXNCOzZCQUMxRCxDQUFDLENBQUM7NEJBQ0gsTUFBTTt5QkFDTjtxQkFDRDtpQkFDRDtnQkFFRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNsRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsSUFBVSxFQUFFLDRCQUE0QixHQUFHLElBQUk7WUFDMUYsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixLQUFLLG9DQUFxQixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzFGLElBQUksNEJBQTRCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ3hFLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsS0FBSyxvQ0FBcUIsQ0FBQyxFQUFFLEVBQUU7b0JBQ25FLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLEVBQUU7b0JBQ3pELE9BQU8sS0FBSyxDQUFDO2lCQUNiO2FBQ0Q7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSx1QkFBdUIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDMUQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixLQUFLLG9DQUFxQixDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQzFGLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEVBQUU7b0JBQ3hDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsS0FBSyxvQ0FBcUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLDZCQUE2QixFQUFFO29CQUNySCxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFO29CQUN6RCxPQUFPLEtBQUssQ0FBQztpQkFDYjthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBR00sYUFBYSxDQUFDLE9BQWdCLEVBQUUsTUFBZSxFQUFFLG9CQUE2QixFQUFFLE9BQWtDO1lBQ3hILE1BQU0sT0FBTyxHQUFHLElBQUksc0NBQTRCLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsRUFBRTtnQkFDN0gsSUFBSSxPQUFPLEVBQUUsc0JBQXNCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUNyRSxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxJQUFJLFVBQVUsRUFBRTtvQkFDZixJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDckMsT0FBTyxLQUFLLENBQUM7cUJBQ2I7b0JBRUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7d0JBQ2xGLE9BQU8sS0FBSyxDQUFDO3FCQUNiO2lCQUNEO2dCQUVELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7WUFHSCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDO2lCQUM3QyxLQUFLLEVBQUU7aUJBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxTQUFTLEdBQWU7Z0JBQzdCLGNBQWMsRUFBRSxLQUFLO2dCQUNyQixVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDaEMsQ0FBQztZQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVwQyxJQUFJLG9CQUFvQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUU7Z0JBRTVGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBZSxDQUFDLENBQUM7YUFDMUU7WUFFRCxPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRU0sbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxTQUFxQjtZQUNqRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSw2QkFBcUIsQ0FBQztpQkFDL0UsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFTSx5QkFBeUIsQ0FBQyxPQUFnQixFQUFFLFNBQXFCLEVBQUUsUUFBa0I7WUFDM0YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLDZCQUFxQixDQUFDO2lCQUMvRixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVNLDBCQUEwQixDQUFDLE9BQWdCLEVBQUUsU0FBcUIsRUFBRSxhQUE0QjtZQUN0RyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsNkJBQXFCLENBQUM7aUJBQ3JHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSw2QkFBcUIsQ0FBQztpQkFDN0YsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBRU0sbUJBQW1CLENBQUMsT0FBZ0I7WUFDMUMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVNLGtCQUFrQixDQUFDLE9BQWdCLEVBQUUsY0FBd0IsRUFBRSxPQUFrQztZQUN2RyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxPQUFnQixFQUFFLFNBQXFCLEVBQUUsY0FBd0IsRUFBRSxPQUFrQztZQUM5SCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsNkJBQXFCLENBQUMsQ0FBQztZQUN6RixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7b0JBQ2xGLFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNuRCxTQUFTO2lCQUNUO2dCQUVELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUU7b0JBQ2pDLElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNyQyxTQUFTO3FCQUNUO29CQUVELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE1BQU0sV0FBVyxHQUFHLG1DQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBQzVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDbkYsSUFBSSxLQUFLLEVBQUU7d0JBQ1YsT0FBTyxLQUFLLENBQUM7cUJBQ2I7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSx5QkFBeUIsQ0FBQyxPQUFnQixFQUFFLFNBQXFCLEVBQUUsYUFBNEIsRUFBRSxPQUFrQztZQUN6SSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsNkJBQXFCLENBQUMsQ0FBQztZQUN6RixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDekIsSUFBSSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7b0JBQ2xGLFNBQVM7aUJBQ1Q7Z0JBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO29CQUNuRCxTQUFTO2lCQUNUO2dCQUVELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLEVBQUU7b0JBQzFELElBQUksT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNyQyxTQUFTO3FCQUNUO29CQUVELE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE1BQU0sV0FBVyxHQUFHLG1DQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7b0JBQzVELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBa0IsRUFBRSxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ2xHLElBQUksS0FBSyxFQUFFO3dCQUNWLE9BQU8sS0FBSyxDQUFDO3FCQUNiO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sZUFBZSxDQUFDLE9BQWdCLEVBQUUsSUFBVSxFQUFFLE9BQWtDO1lBQ3RGLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDckUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEtBQUssSUFBSSxFQUFFO29CQUN6RixJQUFJLEdBQUcsS0FBSyxnQkFBZ0IsSUFBSSxPQUFPLEVBQUUsMEJBQTBCLEVBQUU7d0JBQ3BFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDN0M7b0JBRUQsT0FBTyxJQUFJLENBQUM7aUJBQ1o7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLGNBQWMsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDakQsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsV0FBVyxFQUFFO2dCQUMzRCxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRTtnQkFFN0YsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLGlCQUFpQixDQUFDLE9BQWdCLEVBQUUsSUFBVTtZQUNwRCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxPQUFnQixFQUFFLFFBQWtCO1lBQ2hFLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxxQkFBYSxDQUFDLHlCQUF5QixDQUFDO2dCQUN2RixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLHFCQUFhLENBQUMsMkJBQTJCLENBQUM7Z0JBQ25GLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUscUJBQWEsQ0FBQyw2QkFBNkIsQ0FBQztnQkFDckYsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxxQkFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVNLGVBQWUsQ0FBQyxJQUFVO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFTSxjQUFjLENBQUMsSUFBVTtZQUMvQixPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsb0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU0sZ0JBQWdCLENBQUMsSUFBVSxFQUFFLFVBQXNCO1lBQ3pELE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNuRSxDQUFDO1FBRU0sUUFBUSxDQUFDLE9BQWdCLEVBQUUsVUFBc0IsRUFBRSxtQkFBZ0M7WUFDekYsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQztpQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNkLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLE9BQU8sV0FBVyxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0osQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLENBQUM7UUFFTSxXQUFXLENBQUMsT0FBZ0IsRUFBRSxHQUFlLEVBQUUsbUJBQWdDO1lBQ3JGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3RFLElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksbUJBQW1CLEtBQUssU0FBUyxFQUFFO2dCQUVyRSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDN0M7WUFFRCxPQUFPLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsRSxDQUFDO1FBRU0sMEJBQTBCLENBQUMsT0FBZ0IsRUFBRSxNQUFjO1lBQ2pFLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLElBQXNCLENBQUM7WUFFM0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM1QixJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3RSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUVyRDtpQkFBTTtnQkFDTixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsY0FBYyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUM7Z0JBRXJFLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLEtBQUssa0JBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLG9CQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVHO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sMkJBQTJCLENBQUMsT0FBZ0IsRUFBRSxXQUF3QjtZQUM1RSxNQUFNLGtCQUFrQixHQUFHLDhCQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDeEIsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLElBQXNCLENBQUM7WUFFM0IsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUU7Z0JBQzlCLE1BQU0sWUFBWSxHQUFHLENBQUMsa0JBQWtCLENBQUMsY0FBYyxJQUFJLGtCQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssa0JBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQ2xHLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxvQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3pHO2lCQUFNO2dCQUNOLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sZ0JBQWdCLENBQUMsT0FBZ0IsRUFBRSxLQUFnQjtZQUN6RCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDO2lCQUM5RCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2QsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFRLENBQUMsVUFBVSxFQUFFO29CQUV0QyxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUNyQyxPQUFPLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUwsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqRSxJQUFJLG1CQUFtQixFQUFFO2dCQUN4QixLQUFLLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7YUFDL0I7WUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2lCQUN0QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakYsT0FBTyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU0sdUJBQXVCLENBQUMsSUFBVTtZQUN4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO2dCQUN6QyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBRXpDLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRTdDLEtBQUssTUFBTSxVQUFVLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLEVBQUU7Z0JBQ2xELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxXQUFXLEVBQUU7b0JBQ2hCLEtBQUssSUFBSSxXQUFXLENBQUM7aUJBQ3JCO2dCQUVELE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxlQUFlLEVBQUU7b0JBQ3BCLEtBQUssSUFBSSxlQUFlLENBQUM7aUJBQ3pCO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLE1BQVksRUFBRSxNQUFnQjtZQUMzRSxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLG9CQUFVLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXZGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDO1lBQ2xELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDN0IsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQztvQkFDM0QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO29CQUNwQixNQUFNO29CQUNOLFlBQVk7b0JBQ1osVUFBVTtpQkFDVixDQUFDLEVBQUUsYUFBYSxDQUFDO2dCQUNsQixJQUFJLGFBQWEsS0FBSyxTQUFTLEVBQUU7b0JBQ2hDLFlBQVksR0FBRyxhQUFhLENBQUM7aUJBQzdCO2FBQ0Q7WUFFRCxPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRU0sbUJBQW1CLENBQUMsT0FBZ0IsRUFBRSxtQkFBZ0M7WUFDNUUsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLGtCQUFTLENBQUMsUUFBUSxFQUFFLG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEcsSUFBSSxzQkFBc0IsRUFBRTtnQkFDM0IsT0FBTyxzQkFBc0IsQ0FBQzthQUM5QjtZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JGLE9BQU87b0JBQ04sU0FBUyxFQUFFLGtCQUFTLENBQUMsT0FBTztvQkFDNUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVztpQkFDbkMsQ0FBQzthQUNGO1FBQ0YsQ0FBQztRQUVPLG1CQUFtQixDQUFDLE9BQWdCLEVBQUUsU0FBb0IsRUFBRSxHQUFnQixFQUFFLFNBQTJDLEVBQUUsbUJBQWdDO1lBQ2xLLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTlELElBQUksY0FBc0IsQ0FBQztZQUMzQixJQUFJLEdBQUcsRUFBRTtnQkFDUixjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRXRGLElBQUksR0FBRyxLQUFLLG9CQUFVLENBQUMsTUFBTSxFQUFFO29CQUU5QixJQUFJLGVBQXFDLENBQUM7b0JBQzFDLElBQUksdUJBQTJDLENBQUM7b0JBRWhELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTt3QkFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFOzRCQUM3QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN6RyxJQUFJLElBQUksRUFBRSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dDQUMvQyxNQUFNLFFBQVEsR0FBRyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQzVFLElBQUksdUJBQXVCLEtBQUssU0FBUyxJQUFJLHVCQUF1QixHQUFHLFFBQVEsRUFBRTtvQ0FDaEYsdUJBQXVCLEdBQUcsUUFBUSxDQUFDO29DQUNuQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztpQ0FDaEM7NkJBQ0Q7eUJBQ0Q7cUJBQ0Q7b0JBRUQsSUFBSSxlQUFlLEVBQUU7d0JBRXBCLGNBQWM7NkJBQ1osSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFOzRCQUN0QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxlQUFnQixDQUFDLENBQUM7NEJBQzVFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLGVBQWdCLENBQUMsQ0FBQzs0QkFDNUUsSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO2dDQUN4QixPQUFPLE9BQU8sR0FBRyxPQUFPLENBQUM7NkJBQ3pCOzRCQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUMzRyxDQUFDLENBQUMsQ0FBQztxQkFFSjt5QkFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFNBQVMsRUFBRTt3QkFFbEUsT0FBTyxTQUFTLENBQUM7cUJBQ2pCO2lCQUNEO2dCQUVELElBQUksY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksbUJBQW1CLEtBQUssU0FBUyxFQUFFO29CQUVyRSxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM1RTthQUVEO2lCQUFNLElBQUksU0FBUyxFQUFFO2dCQUNyQixjQUFjLEdBQUcsRUFBRSxDQUFDO2dCQUVwQixLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtvQkFDakMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQzNDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztxQkFFdEg7eUJBQU07d0JBQ04sY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3FCQUNySDtpQkFDRDthQUVEO2lCQUFNO2dCQUNOLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFFOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDM0IsTUFBTSxpQkFBaUIsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxpQkFBaUIsS0FBSyxZQUFZLEVBQUU7d0JBQzdELE9BQU8sU0FBUyxDQUFDO3FCQUNqQjtvQkFFRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN4QyxPQUFPOzRCQUNOLFNBQVM7NEJBQ1QsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7eUJBQ3ZCLENBQUM7cUJBQ0Y7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxPQUFnQixFQUFFLFVBQXNCLEVBQUUsbUJBQWdDLEVBQUUsY0FBd0I7WUFDaEksTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDO2lCQUM5RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDckMsT0FBTyxXQUFXLElBQUksV0FBVyxDQUFDLEtBQUssS0FBSyxrQkFBUyxDQUFDLElBQUk7b0JBQ3pELENBQUMsbUJBQW1CLEtBQUssU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUksQ0FBQyxDQUFDLENBQUM7WUFDSixJQUFJLFVBQVUsS0FBSyxvQkFBVSxDQUFDLE1BQU0sRUFBRTtnQkFDckMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDM0c7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSw4QkFBOEIsQ0FBQyxPQUFnQixFQUFFLFNBQW9CO1lBQzNFLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztpQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNkLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLE9BQU8sV0FBVyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLHdCQUF3QixDQUFDLE9BQWdCLEVBQUUsR0FBZSxFQUFFLGNBQXdCO1lBQzFGLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztpQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNkLElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVDLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2pCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksR0FBRyxLQUFLLG9CQUFVLENBQUMsTUFBTSxFQUFFO29CQUM5QixPQUFPLFdBQVcsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDO2lCQUN4QztnQkFFRCxPQUFPLFdBQVcsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDZCxJQUFJLEdBQUcsS0FBSyxvQkFBVSxDQUFDLE1BQU0sRUFBRTtvQkFDOUIsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDbkMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDbkMsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxTQUFTO3dCQUMzRCxZQUFZLENBQUMsTUFBTSxLQUFLLFNBQVMsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLFNBQVM7d0JBQ3RFLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUyxJQUFJLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO3dCQUNoRixJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLE1BQU0sRUFBRTs0QkFDaEQsTUFBTSxZQUFZLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFDaEgsTUFBTSxZQUFZLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFFaEgsT0FBTyxZQUFZLEdBQUcsWUFBWSxDQUFDO3lCQUNuQzt3QkFFRCxPQUFPLFlBQVksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztxQkFDakQ7aUJBQ0Q7Z0JBRUQsT0FBTyxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkcsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBT00sZ0JBQWdCLENBQUMsT0FBZ0IsRUFBRSwyQkFBb0M7WUFDN0UsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQVksMEJBQWUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFbEgsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztpQkFDbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsMkJBQTJCLEVBQUU7Z0JBQ2pDLGFBQWEsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM5RTtZQUVELE9BQU8sYUFBYSxDQUFDO1FBQ3RCLENBQUM7UUFNTSxlQUFlLENBQUMsT0FBZ0I7WUFDdEMsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO1lBRXpCLEtBQUssTUFBTSxHQUFHLElBQUksMkJBQW1CLEVBQUU7Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFxQixDQUFDO2dCQUN4RCxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksS0FBSyxJQUFJLEVBQUU7b0JBQzlELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Q7WUFFRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFLTSxjQUFjLENBQUMsT0FBZ0IsRUFBRSxVQUFvRCxFQUFFO1lBQzdGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRCxPQUFPLEtBQUs7aUJBQ1YsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNkLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7b0JBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztvQkFDbkMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsSUFBSSxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQy9ELE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQU9ELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDO2lCQUNELElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFTSwyQkFBMkIsQ0FBQyxPQUFnQjtZQUNsRCxJQUFJLElBQUksQ0FBQyw2QkFBNkIsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUM7cUJBQzdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzdDLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzFDLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO29CQUN4RCxPQUFPLEtBQUssR0FBRyxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUMsQ0FBQztnQkFDL0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNOLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQVcsYUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUM7YUFDckc7WUFFRCxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQztRQUMzQyxDQUFDO1FBRU0sUUFBUSxDQUFDLE9BQWdCLEVBQUUsVUFBbUI7WUFDcEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQ3RCLElBQUksQ0FBQyxFQUFFLENBQ04sSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTO2dCQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUM7Z0JBQ25CLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQy9FLENBQUM7UUFDSCxDQUFDO1FBRU0seUJBQXlCLENBQUMsT0FBZ0IsRUFBRSxpQkFBK0M7WUFDakcsTUFBTSxTQUFTLEdBQWUsRUFBRSxDQUFDO1lBRWpDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9FLEtBQUssTUFBTSxFQUFFLElBQUksV0FBVyxFQUFFO2dCQUM3QixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLGVBQWUsR0FBRyxtQ0FBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLEtBQUssSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLG9CQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxLQUFLLEVBQUUsRUFBRTt3QkFDckcsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDbkI7aUJBQ0Q7YUFDRDtZQUVELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXRHLE9BQU8sYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQixFQUFFLElBQVU7WUFDL0QsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7Z0JBQ3BILEtBQUssTUFBTSxRQUFRLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7b0JBQ2xELE1BQU0saUJBQWlCLEdBQUcsUUFBc0IsQ0FBQztvQkFDakQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFFckUsT0FBTyxpQkFBaUIsQ0FBQztxQkFDekI7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDaEMsQ0FBQztRQUVNLGtCQUFrQixDQUFDLE9BQWdCO1lBQ3pDLE1BQU0sMEJBQTBCLEdBQVcsRUFBRSxDQUFDO1lBQzlDLE1BQU0sd0JBQXdCLEdBQVcsRUFBRSxDQUFDO1lBRTVDLEtBQUssTUFBTSxjQUFjLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFO2dCQUNwRSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsRUFBRTtvQkFDdEUsMEJBQTBCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2lCQUNoRDtxQkFBTTtvQkFDTix3QkFBd0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQzlDO2FBQ0Q7WUFFRCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQTtRQUNoRSxDQUFDO1FBS08sZ0JBQWdCO1lBQ3ZCLE1BQU0sTUFBTSxHQUFrQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRXhDLE1BQU0sYUFBYSxHQUFHLENBQUMscUJBQWEsQ0FBQyxTQUFTLEVBQUUscUJBQWEsQ0FBQyxLQUFLLEVBQUUscUJBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVqSyxLQUFLLE1BQU0sZUFBZSxJQUFJLGFBQWEsRUFBRTtnQkFDNUMsTUFBTSxTQUFTLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4SCxLQUFLLE1BQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtvQkFDakMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNyQjtpQkFDRDthQUNEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBS08sZ0JBQWdCLENBQUMsVUFBbUI7WUFDM0MsTUFBTSxNQUFNLEdBQWtCLElBQUksR0FBRyxFQUFFLENBQUM7WUFFeEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxlQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFRLENBQUMsRUFBRTtnQkFDOUMsTUFBTSxXQUFXLEdBQUcsbUNBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sVUFBVSxHQUFHLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxvQkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLFNBQVM7aUJBQ1Q7Z0JBRUQsTUFBTSxpQkFBaUIsR0FBRyw0QkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFekQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUU7b0JBQ3JGLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3JCLFNBQVE7aUJBQ1I7YUFDRDtZQUVELE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLGtCQUFrQixDQUFDLGlCQUFxQztZQUMvRCxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLGlCQUFpQixDQUFDO1lBRTlDLEtBQUssTUFBTSxZQUFZLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBWSxDQUFDLEVBQUU7Z0JBQ3RELE1BQU0sYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRixLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtvQkFDekMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDckMsT0FBTyxJQUFJLENBQUM7cUJBQ1o7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVPLFFBQVEsQ0FBQyxRQUFrQjtZQUNsQyxNQUFNLEtBQUssR0FBRyxtQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxvQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLE9BQU8sS0FBSyxLQUFLLFNBQVM7Z0JBQ3pCLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNiLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDZixDQUFDOztJQXQ1QnVCLCtCQUFpQixHQUErQixJQUFJLEdBQUcsRUFBRSxBQUF4QyxDQUF5QztJQUMxRCxzQ0FBd0IsR0FBc0MsSUFBSSxHQUFHLEVBQUUsQUFBL0MsQ0FBZ0Q7SUFDeEUsa0NBQW9CLEdBQWlDLElBQUksR0FBRyxFQUFFLEFBQTFDLENBQTJDO0lBTjNFLHNDQUFhIn0=