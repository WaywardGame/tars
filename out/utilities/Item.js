define(["require", "exports", "game/doodad/Doodads", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemDescriptions", "game/item/ItemRecipeRequirementChecker", "game/tile/Terrains", "utilities/enum/Enums", "game/item/ItemManager", "utilities/math/Vector2", "../core/context/IContext", "../core/ITars", "../core/ITarsOptions"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemDescriptions_1, ItemRecipeRequirementChecker_1, Terrains_1, Enums_1, ItemManager_1, Vector2_1, IContext_1, ITars_1, ITarsOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemUtilities = void 0;
    class ItemUtilities {
        constructor() {
            this.groundItemCache = new Map();
            this.disassembleSearchCache = new Map();
        }
        static getRelatedItemTypes(itemType) {
            let result = this.relatedItemsCache.get(itemType);
            if (result === undefined) {
                result = new Set();
                let queue = [itemType];
                while (queue.length > 0) {
                    const relatedItemType = queue.shift();
                    if (result.has(relatedItemType)) {
                        continue;
                    }
                    result.add(relatedItemType);
                    const description = ItemDescriptions_1.itemDescriptions[relatedItemType];
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
                    queue.push(...Array.from(this.getDismantleSearch(relatedItemType)));
                }
                this.relatedItemsCache.set(itemType, result);
            }
            return result;
        }
        static getRelatedItemTypesByGroup(itemTypeGroup) {
            let result = this.relatedItemsByGroupCache.get(itemTypeGroup);
            if (result === undefined) {
                result = new Set();
                for (const itemTypeForGroup of ItemManager_1.default.getGroupItems(itemTypeGroup)) {
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
            this.itemCache = undefined;
            this.groundItemCache.clear();
            this.disassembleSearchCache.clear();
        }
        getBaseItems(context) {
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
        isAllowedToUseItem(context, item, allowProtectedInventoryItems = true) {
            if (context.options.useProtectedItems !== ITarsOptions_1.TarsUseProtectedItems.Yes && item.isProtected()) {
                if (allowProtectedInventoryItems && this.isInventoryItem(context, item)) {
                    return true;
                }
                if (context.options.useProtectedItems === ITarsOptions_1.TarsUseProtectedItems.No) {
                    return false;
                }
                if (item.minDur !== undefined && item.minDur < 5) {
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
                if (item.minDur !== undefined && item.minDur < 5) {
                    return false;
                }
            }
            return true;
        }
        processRecipe(context, recipe, useIntermediateChest, options) {
            const checker = new ItemRecipeRequirementChecker_1.default(context.human, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
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
            return context.island.items.getItemsInContainer(container, { includeSubContainers: true })
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getItemsInContainerByType(context, container, itemType) {
            return context.island.items.getItemsInContainerByType(container, itemType, { includeSubContainers: true })
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getItemsInContainerByGroup(context, container, itemTypeGroup) {
            return context.island.items.getItemsInContainerByGroup(container, itemTypeGroup, { includeSubContainers: true })
                .filter(item => this.isAllowedToUseItem(context, item));
        }
        getEquipmentItemsInInventory(context) {
            return context.island.items.getItemsInContainer(context.human.inventory, { includeSubContainers: true })
                .filter(item => item.description()?.equip !== undefined && this.isAllowedToUseEquipItem(context, item));
        }
        getItemsInInventory(context) {
            return this.getItemsInContainer(context, context.human.inventory);
        }
        getItemInInventory(context, itemTypeSearch, options) {
            return this.getItemInContainer(context, context.human.inventory, itemTypeSearch, options);
        }
        getItemInContainer(context, container, itemTypeSearch, options) {
            const orderedItems = context.island.items.getOrderedContainerItems(container);
            for (const item of orderedItems) {
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
            const orderedItems = context.island.items.getOrderedContainerItems(container);
            for (const item of orderedItems) {
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
                        return this.isSafeToDrinkItem(item);
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
        isSafeToDrinkItem(item) {
            return item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater) ||
                item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater) ||
                item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater) ||
                item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfFilteredWater);
        }
        isDrinkableItem(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.DrinkItem);
        }
        canGatherWater(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.GatherLiquid);
        }
        hasUseActionType(item, actionType) {
            return item.description()?.use?.includes(actionType) ? true : false;
        }
        getTools(context, actionType, preferredDamageType) {
            return this.getInventoryItemsWithUse(context, actionType)
                .filter(item => {
                const description = item.description();
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
            const description = doodad.description();
            if (!description) {
                return undefined;
            }
            let tool;
            const stage = doodad.getGrowingStage();
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
            const terrainDescription = Terrains_1.default[terrainType];
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
                const description = item.description();
                return description && description.equip === equip;
            }));
            const currentEquippedItem = context.human.getEquippedItem(equip);
            if (currentEquippedItem) {
                items.add(currentEquippedItem);
            }
            return Array.from(items).sort((a, b) => this.calculateEquipItemScore(b) - this.calculateEquipItemScore(a));
        }
        calculateEquipItemScore(item) {
            const description = item.description();
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
        estimateDamageModifier(context, weapon, target) {
            const weaponDescription = weapon.description();
            const creatureDescription = target.description();
            if (!weaponDescription || !creatureDescription) {
                return -99;
            }
            const damageType = weaponDescription.damageType;
            if (damageType === undefined) {
                return -99;
            }
            const damageAmount = context.human.calculateDamageAmount(IEntity_1.AttackType.MeleeWeapon, weapon, undefined);
            const damageOutcome = context.island.calculateDamageOutcome({
                human: context.human,
                target,
                damageAmount,
                damageType,
            });
            return damageOutcome?.attackOutcome ?? -99;
        }
        updateHandEquipment(context, preferredDamageType) {
            const mainHandEquipInterrupt = this.getDesiredEquipment(context, IHuman_1.EquipType.MainHand, IAction_1.ActionType.Attack);
            if (mainHandEquipInterrupt) {
                return mainHandEquipInterrupt;
            }
            if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
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
                            const point = context.human.island.ensureValidPoint({ x: context.human.x + x, y: context.human.y + y, z: context.human.z });
                            if (point) {
                                const tile = context.island.getTileFromPoint(point);
                                if (tile.creature && !tile.creature.isTamed()) {
                                    const distance = Vector2_1.default.squaredDistance(context.human, tile.creature.getPoint());
                                    if (closestCreatureDistance === undefined || closestCreatureDistance > distance) {
                                        closestCreatureDistance = distance;
                                        closestCreature = tile.creature;
                                    }
                                }
                            }
                        }
                    }
                    if (closestCreature) {
                        possibleEquips
                            .sort((a, b) => this.estimateDamageModifier(context, b, closestCreature) - this.estimateDamageModifier(context, a, closestCreature));
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
        getPossibleHandEquips(context, actionType, preferredDamageType, filterEquipped) {
            const items = this.getInventoryItemsWithUse(context, actionType, filterEquipped)
                .filter(item => {
                const description = item.description();
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
                const description = item.description();
                return description && description.equip === equipType;
            });
        }
        getInventoryItemsWithUse(context, use, filterEquipped) {
            return this.getItemsInInventory(context)
                .filter(item => {
                if (filterEquipped && item.isEquipped()) {
                    return false;
                }
                const description = item.description();
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
                    const descriptionA = a.description();
                    const descriptionB = b.description();
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
                return a.minDur !== undefined && b.minDur !== undefined ? b.minDur - a.minDur : 0;
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
                if (context.inventory[key] !== undefined) {
                    items.push(context.inventory[key]);
                }
            }
            return items;
        }
        getUnusedItems(context, options = {}) {
            const items = this.getItemsInInventory(context);
            return items
                .filter(item => {
                if (item.isEquipped() ||
                    ((!options.allowSailboat || item !== context.inventory.sailBoat) && this.isInventoryItem(context, item)) ||
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
                const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
                this.availableInventoryWeightCache = context.human.stat.get(IStats_1.Stat.Weight).max - itemsWeight;
            }
            return this.availableInventoryWeightCache;
        }
        getSeeds(context, onlyEdible) {
            const baseItems = this.getBaseItems(context);
            return baseItems.filter(item => item.minDur !== undefined &&
                item.minDur > 0 &&
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
        getWaterContainers(context) {
            const drinkableWaterContainers = [];
            const availableWaterContainers = [];
            for (const waterContainer of context.inventory.waterContainer ?? []) {
                if (context.utilities.item.isSafeToDrinkItem(waterContainer)) {
                    drinkableWaterContainers.push(waterContainer);
                }
                else {
                    availableWaterContainers.push(waterContainer);
                }
            }
            return { drinkableWaterContainers, availableWaterContainers };
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
                const doodadDescription = Doodads_1.default[doodadType];
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
            return onEat !== undefined && onEat[0] > 1;
        }
    }
    exports.ItemUtilities = ItemUtilities;
    ItemUtilities.relatedItemsCache = new Map();
    ItemUtilities.relatedItemsByGroupCache = new Map();
    ItemUtilities.dismantleSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBK0JBLE1BQWEsYUFBYTtRQUExQjtZQVlrQixvQkFBZSxHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ25ELDJCQUFzQixHQUF3QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBNjFCMUYsQ0FBQztRQXgxQk8sTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQWtCO1lBQ25ELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN6QixNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFFbkIsSUFBSSxLQUFLLEdBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbkMsT0FBTyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDeEIsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRyxDQUFDO29CQUV2QyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUU7d0JBQ2hDLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFFNUIsTUFBTSxXQUFXLEdBQUcsbUNBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ3RELElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ2pCLFNBQVM7cUJBQ1Q7b0JBRUQsTUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7b0JBQ3BELElBQUksY0FBYyxFQUFFO3dCQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxD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