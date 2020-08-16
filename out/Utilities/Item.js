define(["require", "exports", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "item/IItem", "item/ItemRecipeRequirementChecker", "item/Items", "utilities/enum/Enums", "../ITars", "./Doodad"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, ITars_1, Doodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.foodItemTypes = exports.getInventoryItemForDoodad = exports.getSeeds = exports.getAvailableInventoryWeight = exports.getUnusedItems = exports.getReservedItems = exports.getInventoryItemsWithUse = exports.getInventoryItemsWithEquipType = exports.getPossibleHandEquips = exports.estimateDamageModifier = exports.calculateEquipItemScore = exports.getBestEquipment = exports.getBestActionItem = exports.hasUseActionType = exports.canGatherWater = exports.isDrinkableItem = exports.isSafeToDrinkItem = exports.isInventoryItem = exports.getItemInContainer = exports.getItemInInventory = exports.processRecipe = void 0;
    function processRecipe(context, recipe, useIntermediateChest) {
        const checker = new ItemRecipeRequirementChecker_1.default(context.player, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
            if (isConsumed) {
                return !context.isReservedItem(item) && !isInventoryItem(context, item);
            }
            if (forItemTypeOrGroup === IItem_1.ItemTypeGroup.Sharpened) {
                return item === context.inventory.knife;
            }
            return true;
        });
        const items = context.player.inventory.containedItems;
        const container = {
            weightCapacity: context.player.inventory.weightCapacity,
            containedItems: items,
            itemOrders: items.map(i => i.id),
        };
        checker.processContainer(container, true);
        if (useIntermediateChest && context.base.intermediateChest[0] && !checker.requirementsMet()) {
            checker.processContainer(context.base.intermediateChest[0], true);
        }
        return checker;
    }
    exports.processRecipe = processRecipe;
    function getItemInInventory(context, itemTypeSearch) {
        return getItemInContainer(context, context.player.inventory, itemTypeSearch, true);
    }
    exports.getItemInInventory = getItemInInventory;
    function getItemInContainer(context, container, itemTypeSearch, excludeUsefulItems = true) {
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
            const description = Items_1.default[item.type];
            if (description && description.weightCapacity !== undefined) {
                const item2 = getItemInContainer(context, item, itemTypeSearch, excludeUsefulItems);
                if (item2) {
                    return item2;
                }
            }
        }
        return undefined;
    }
    exports.getItemInContainer = getItemInContainer;
    function isInventoryItem(context, item) {
        const keys = Object.keys(ITars_1.inventoryItemInfo);
        for (const key of keys) {
            const inventoryItem = context.inventory[key];
            if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
                return true;
            }
        }
        return false;
    }
    exports.isInventoryItem = isInventoryItem;
    function isSafeToDrinkItem(item) {
        return itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater)
            || itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater)
            || itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater);
    }
    exports.isSafeToDrinkItem = isSafeToDrinkItem;
    function isDrinkableItem(item) {
        return hasUseActionType(item, IAction_1.ActionType.DrinkItem);
    }
    exports.isDrinkableItem = isDrinkableItem;
    function canGatherWater(item) {
        return hasUseActionType(item, IAction_1.ActionType.GatherWater);
    }
    exports.canGatherWater = canGatherWater;
    function hasUseActionType(item, actionType) {
        var _a, _b;
        return ((_b = (_a = item.description()) === null || _a === void 0 ? void 0 : _a.use) === null || _b === void 0 ? void 0 : _b.includes(actionType)) ? true : false;
    }
    exports.hasUseActionType = hasUseActionType;
    function getBestActionItem(context, use, preferredDamageType) {
        let possibleEquips = getPossibleHandEquips(context, use, preferredDamageType);
        if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
            possibleEquips = getPossibleHandEquips(context, use);
        }
        if (possibleEquips.length > 0) {
            return possibleEquips[0];
        }
        return undefined;
    }
    exports.getBestActionItem = getBestActionItem;
    function getBestEquipment(context, equip) {
        return context.player.inventory.containedItems
            .filter(item => {
            if (item.type === IItem_1.ItemType.AnimalPelt) {
                return false;
            }
            const description = item.description();
            return description && description.equip === equip;
        })
            .sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
    }
    exports.getBestEquipment = getBestEquipment;
    function calculateEquipItemScore(item) {
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
    exports.calculateEquipItemScore = calculateEquipItemScore;
    function estimateDamageModifier(weapon, target) {
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
    exports.estimateDamageModifier = estimateDamageModifier;
    function getPossibleHandEquips(context, use, preferredDamageType, filterEquipped) {
        return getInventoryItemsWithUse(context, use, filterEquipped)
            .filter(item => {
            const description = item.description();
            return description && description.equip === IHuman_1.EquipType.Held &&
                (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
        });
    }
    exports.getPossibleHandEquips = getPossibleHandEquips;
    function getInventoryItemsWithEquipType(context, equipType) {
        return context.player.inventory.containedItems.filter(item => {
            const description = item.description();
            return description && description.equip === equipType;
        });
    }
    exports.getInventoryItemsWithEquipType = getInventoryItemsWithEquipType;
    function getInventoryItemsWithUse(context, use, filterEquipped) {
        return context.player.inventory.containedItems
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
                        return damageTypesA < damageTypesB ? 1 : -1;
                    }
                    return descriptionA.attack < descriptionB.attack ? 1 : -1;
                }
            }
            return a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0;
        });
    }
    exports.getInventoryItemsWithUse = getInventoryItemsWithUse;
    function getReservedItems(context) {
        return context.player.inventory.containedItems
            .filter(item => context.isReservedItem(item) && !isInventoryItem(context, item));
    }
    exports.getReservedItems = getReservedItems;
    function getUnusedItems(context, ignoreReserved = false) {
        return context.player.inventory.containedItems
            .filter(item => {
            if (item.isEquipped() || isInventoryItem(context, item) || (!ignoreReserved && context.isReservedItem(item))) {
                return false;
            }
            const description = item.description();
            if (description && description.use && (description.use.includes(IAction_1.ActionType.GatherWater) || description.use.includes(IAction_1.ActionType.DrinkItem))) {
                return false;
            }
            return true;
        })
            .sort((a, b) => context.player.inventory.containedItems.indexOf(a) > context.player.inventory.containedItems.indexOf(b) ? 1 : -1);
    }
    exports.getUnusedItems = getUnusedItems;
    function getAvailableInventoryWeight(context) {
        const items = context.player.inventory.containedItems
            .filter(item => isInventoryItem(context, item));
        const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
        return context.player.stat.get(IStats_1.Stat.Weight).max - itemsWeight;
    }
    exports.getAvailableInventoryWeight = getAvailableInventoryWeight;
    function getSeeds(context) {
        return itemManager.getItemsInContainerByGroup(context.player.inventory, IItem_1.ItemTypeGroup.Seed, true)
            .filter(seed => seed.minDur !== undefined && seed.minDur > 0 && seed.type !== IItem_1.ItemType.GrassSeeds && seed.type !== IItem_1.ItemType.MapleSeeds);
    }
    exports.getSeeds = getSeeds;
    function getInventoryItemForDoodad(context, doodadTypeOrGroup) {
        const itemTypes = [];
        const doodadTypes = Doodad_1.getDoodadTypes(doodadTypeOrGroup);
        for (const dt of doodadTypes) {
            for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                const itemDescription = Items_1.default[it];
                if (itemDescription && itemDescription.onUse && itemDescription.onUse[IAction_1.ActionType.Build] === dt) {
                    itemTypes.push(it);
                }
            }
        }
        const matchingItems = itemManager.getItemsInContainer(context.player.inventory, true).filter(item => itemTypes.includes(item.type));
        return matchingItems[0];
    }
    exports.getInventoryItemForDoodad = getInventoryItemForDoodad;
    const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
    function getFoodItemTypes() {
        const result = [];
        for (const itemTypeOrGroup of goodFoodItems) {
            const itemTypes = itemManager.isGroup(itemTypeOrGroup) ? itemManager.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
            for (const itemType of itemTypes) {
                const description = Items_1.itemDescriptions[itemType];
                if (description) {
                    const onUse = description.onUse;
                    if (onUse) {
                        const onEat = onUse[IAction_1.ActionType.Eat];
                        if (onEat) {
                            if (onEat[0] > 1) {
                                result.push(itemType);
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
    exports.foodItemTypes = getFoodItemTypes();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBa0JBLFNBQWdCLGFBQWEsQ0FBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxvQkFBNkI7UUFDN0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQ0FBNEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxFQUFFO1lBQzlILElBQUksVUFBVSxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN4RTtZQUVELElBQUksa0JBQWtCLEtBQUsscUJBQWEsQ0FBQyxTQUFTLEVBQUU7Z0JBRW5ELE9BQU8sSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2FBQ3hDO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztRQUN0RCxNQUFNLFNBQVMsR0FBZTtZQUM3QixjQUFjLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYztZQUN2RCxjQUFjLEVBQUUsS0FBSztZQUNyQixVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDaEMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUMsSUFBSSxvQkFBb0IsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFD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