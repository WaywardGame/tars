define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemRecipeRequirementChecker", "game/item/Items", "utilities/enum/Enums", "game/tile/Terrains", "game/doodad/Doodads", "game/item/ItemManager", "../core/context/IContext", "../core/ITarsOptions", "utilities/math/Vector2"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, Terrains_1, Doodads_1, ItemManager_1, IContext_1, ITarsOptions_1, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemUtilities = void 0;
    class ItemUtilities {
        constructor() {
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
                    const description = Items_1.itemDescriptions[relatedItemType];
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
                    const description = Items_1.itemDescriptions[it];
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
            this.seedItemTypes = this.getSeedItemTypes();
        }
        clearCache() {
            this.availableInventoryWeightCache = undefined;
            this.itemCache = undefined;
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
        processRecipe(context, recipe, useIntermediateChest, allowInventoryItems) {
            const checker = new ItemRecipeRequirementChecker_1.default(context.human, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
                if (isConsumed) {
                    if (context.isHardReservedItem(item)) {
                        return false;
                    }
                    if (!allowInventoryItems && this.isInventoryItem(context, item)) {
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
        getItemInInventory(context, itemTypeSearch, allowInventoryItems = false) {
            return this.getItemInContainer(context, context.human.inventory, itemTypeSearch, allowInventoryItems);
        }
        getItemInContainer(context, container, itemTypeSearch, allowInventoryItems = false) {
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
                const description = Items_1.default[item.type];
                if (description && description.weightCapacity !== undefined) {
                    const item2 = this.getItemInContainer(context, item, itemTypeSearch);
                    if (item2) {
                        return item2;
                    }
                }
            }
            return undefined;
        }
        getItemInContainerByGroup(context, container, itemTypeGroup, allowInventoryItems = false) {
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
                const description = Items_1.default[item.type];
                if (description && description.weightCapacity !== undefined) {
                    const item2 = this.getItemInContainerByGroup(context, item, itemTypeGroup);
                    if (item2) {
                        return item2;
                    }
                }
            }
            return undefined;
        }
        isInventoryItem(context, item) {
            for (const [, inventoryItem] of Object.entries(context.inventory)) {
                if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
                    return true;
                }
            }
            return false;
        }
        isSafeToDrinkItem(item) {
            return item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater) ||
                item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater) ||
                item.island.items.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater);
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
        estimateDamageModifier(weapon, target) {
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
            for (const damageType of Enums_1.default.values(IEntity_1.DamageType)) {
                if ((weaponDamageType & damageType) && resists[damageType]) {
                    resist += resists[damageType];
                }
                if ((weaponDamageType & damageType) && vulnerabilities[damageType]) {
                    vulnerable += vulnerabilities[damageType];
                }
            }
            return weaponAttack + vulnerable - resist;
        }
        updateHandEquipment(context, preferredDamageType) {
            const leftHandEquipInterrupt = this.getDesiredEquipment(context, IHuman_1.EquipType.LeftHand, IAction_1.ActionType.Attack);
            if (leftHandEquipInterrupt) {
                return leftHandEquipInterrupt;
            }
            if (context.inventory.equipShield && !context.inventory.equipShield.isEquipped()) {
                return {
                    equipType: IHuman_1.EquipType.RightHand,
                    item: context.inventory.equipShield,
                };
            }
            const leftHandItem = context.human.getEquippedItem(IHuman_1.EquipType.LeftHand);
            const rightHandItem = context.human.getEquippedItem(IHuman_1.EquipType.RightHand);
            const leftHandDescription = leftHandItem ? leftHandItem.description() : undefined;
            const leftHandEquipped = leftHandDescription ? leftHandDescription.attack !== undefined : false;
            const rightHandDescription = rightHandItem ? rightHandItem.description() : undefined;
            const rightHandEquipped = rightHandDescription ? rightHandDescription.attack !== undefined : false;
            if (preferredDamageType !== undefined) {
                let leftHandDamageTypeMatches = false;
                if (leftHandEquipped) {
                    const itemDescription = leftHandItem.description();
                    leftHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
                }
                let rightHandDamageTypeMatches = false;
                if (rightHandEquipped) {
                    const itemDescription = rightHandItem.description();
                    rightHandDamageTypeMatches = itemDescription && itemDescription.damageType !== undefined && (itemDescription.damageType & preferredDamageType) !== 0 ? true : false;
                }
                if (leftHandDamageTypeMatches || rightHandDamageTypeMatches) {
                    if (leftHandDamageTypeMatches !== context.human.options.leftHand) {
                        this.changeEquipmentOption(context, "leftHand");
                    }
                    if (rightHandDamageTypeMatches !== context.human.options.rightHand) {
                        this.changeEquipmentOption(context, "rightHand");
                    }
                }
                else if (leftHandEquipped || rightHandEquipped) {
                    if (leftHandEquipped && !context.human.options.leftHand) {
                        this.changeEquipmentOption(context, "leftHand");
                    }
                    if (rightHandEquipped && !context.human.options.rightHand) {
                        this.changeEquipmentOption(context, "rightHand");
                    }
                }
                else {
                    if (!context.human.options.leftHand) {
                        this.changeEquipmentOption(context, "leftHand");
                    }
                    if (!context.human.options.rightHand) {
                        this.changeEquipmentOption(context, "rightHand");
                    }
                }
            }
            else {
                if (!leftHandEquipped && !rightHandEquipped) {
                    if (!context.human.options.leftHand) {
                        this.changeEquipmentOption(context, "leftHand");
                    }
                }
                else if (leftHandEquipped !== context.human.options.leftHand) {
                    this.changeEquipmentOption(context, "leftHand");
                }
                if (leftHandEquipped) {
                    if (context.human.options.rightHand) {
                        this.changeEquipmentOption(context, "rightHand");
                    }
                }
                else if (rightHandEquipped !== context.human.options.rightHand) {
                    this.changeEquipmentOption(context, "rightHand");
                }
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
                            .sort((a, b) => this.estimateDamageModifier(b, closestCreature) - this.estimateDamageModifier(a, closestCreature));
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
        changeEquipmentOption(context, id) {
            if (context.human.isLocalPlayer()) {
                oldui.changeEquipmentOption(id);
            }
            else if (!context.human.asPlayer) {
                const isLeftHand = id === "leftHand";
                const newValue = isLeftHand ? !context.human.options.leftHand : !context.human.options.rightHand;
                context.human.options[id] = newValue;
            }
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
        hasInventoryItemForAction(context, actionType) {
            return this.getItemsInInventory(context)
                .some(item => {
                const description = item.description();
                if (!description) {
                    return false;
                }
                if (actionType === IAction_1.ActionType.Attack) {
                    return description.attack !== undefined;
                }
                return description.use && description.use.includes(actionType);
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
        getSeeds(context) {
            const baseItems = this.getBaseItems(context);
            return baseItems.filter(item => item.minDur !== undefined &&
                item.minDur > 0 &&
                this.seedItemTypes.has(item.type));
        }
        getInventoryItemForDoodad(context, doodadTypeOrGroup) {
            const itemTypes = [];
            const doodadTypes = context.utilities.doodad.getDoodadTypes(doodadTypeOrGroup);
            for (const dt of doodadTypes) {
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const itemDescription = Items_1.default[it];
                    if (itemDescription && itemDescription.onUse && itemDescription.onUse[IAction_1.ActionType.Build] === dt) {
                        itemTypes.push(it);
                    }
                }
            }
            const matchingItems = this.getItemsInInventory(context).filter(item => itemTypes.includes(item.type));
            return matchingItems[0];
        }
        getFoodItemTypes() {
            const result = new Set();
            const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
            for (const itemTypeOrGroup of goodFoodItems) {
                const itemTypes = ItemManager_1.default.isGroup(itemTypeOrGroup) ? ItemManager_1.default.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
                for (const itemType of itemTypes) {
                    if (this.isHealthyToEat(itemType)) {
                        result.add(itemType);
                    }
                }
            }
            return result;
        }
        getSeedItemTypes() {
            const result = new Set();
            const growingStages = Enums_1.default.values(IDoodad_1.GrowingStage);
            for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                const description = Items_1.itemDescriptions[itemType];
                const doodadType = description?.onUse?.[IAction_1.ActionType.Plant];
                if (doodadType === undefined) {
                    continue;
                }
                const gatherDoodadDescription = Doodads_1.default[doodadType]?.gather;
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
        isHealthyToEat(itemType) {
            const onEat = Items_1.itemDescriptions[itemType]?.onUse?.[IAction_1.ActionType.Eat];
            return onEat !== undefined && onEat[0] > 1;
        }
    }
    exports.ItemUtilities = ItemUtilities;
    ItemUtilities.relatedItemsCache = new Map();
    ItemUtilities.relatedItemsByGroupCache = new Map();
    ItemUtilities.dismantleSearchCache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBMEJBLE1BQWEsYUFBYTtRQUExQjtZQVdrQiwyQkFBc0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTQ0QjFGLENBQUM7UUF2NEJPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFrQjtZQUNuRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBRW5CLElBQUksS0FBSyxHQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRW5DLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQ3hCLE1BQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUcsQ0FBQztvQkFFdkMsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFO3dCQUNoQyxTQUFTO3FCQUNUO29CQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBRTVCLE1BQU0sV0FBVyxHQUFHLHdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO29CQUN0RCxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNqQixTQUFTO3FCQUNUO29CQUVELE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDO29CQUNwRCxJQUFJLGNBQWMsRUFBRTt3QkFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDdkU7b0JBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxD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