define(["require", "exports", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemRecipeRequirementChecker", "game/item/Items", "utilities/enum/Enums", "game/tile/Terrains", "../ITars", "./Doodad"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, Terrains_1, ITars_1, Doodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.foodItemTypes = exports.getInventoryItemForDoodad = exports.getSeeds = exports.getAvailableInventoryWeight = exports.getUnusedItems = exports.getReservedItems = exports.getInventoryItemsWithUse = exports.hasInventoryItemForAction = exports.getInventoryItemsWithEquipType = exports.getPossibleHandEquips = exports.estimateDamageModifier = exports.calculateEquipItemScore = exports.getBestEquipment = exports.getBestToolForTerrainGather = exports.getBestToolForDoodadGather = exports.getBestTool = exports.hasUseActionType = exports.canGatherWater = exports.isDrinkableItem = exports.isSafeToDrinkItem = exports.isInventoryItem = exports.getItemInContainer = exports.getItemInInventory = exports.processRecipe = void 0;
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
    function getBestTool(context, use, preferredDamageType) {
        let possibleEquips = getPossibleHandEquips(context, use, preferredDamageType);
        if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
            possibleEquips = getPossibleHandEquips(context, use);
        }
        return possibleEquips.length > 0 ? possibleEquips[0] : undefined;
    }
    exports.getBestTool = getBestTool;
    function getBestToolForDoodadGather(context, doodad) {
        var _a, _b;
        const description = doodad.description();
        if (!description) {
            return undefined;
        }
        let tool;
        const stage = doodad.getGrowingStage();
        if (stage !== undefined && description.harvest && description.harvest[stage]) {
            tool = getBestTool(context, IAction_1.ActionType.Harvest);
        }
        else {
            const skillType = (_b = (_a = description.gatherSkillUse) !== null && _a !== void 0 ? _a : description.skillUse) !== null && _b !== void 0 ? _b : IHuman_1.SkillType.Mining;
            const prefersBlunt = skillType === IHuman_1.SkillType.Mining;
            tool = getBestTool(context, IAction_1.ActionType.Gather, prefersBlunt ? IEntity_1.DamageType.Blunt : IEntity_1.DamageType.Slashing);
        }
        return tool;
    }
    exports.getBestToolForDoodadGather = getBestToolForDoodadGather;
    function getBestToolForTerrainGather(context, terrainType) {
        var _a;
        const terrainDescription = Terrains_1.default[terrainType];
        if (!terrainDescription) {
            return undefined;
        }
        let tool;
        if (terrainDescription.gather) {
            const prefersBlunt = ((_a = terrainDescription.gatherSkillUse) !== null && _a !== void 0 ? _a : IHuman_1.SkillType.Mining) === IHuman_1.SkillType.Mining;
            tool = getBestTool(context, IAction_1.ActionType.Gather, prefersBlunt ? IEntity_1.DamageType.Blunt : IEntity_1.DamageType.Slashing);
        }
        else {
            tool = getBestTool(context, IAction_1.ActionType.Dig);
        }
        return tool;
    }
    exports.getBestToolForTerrainGather = getBestToolForTerrainGather;
    function getBestEquipment(context, equip) {
        return context.player.inventory.containedItems
            .filter(item => {
            if (item.type === IItem_1.ItemType.AnimalPelt) {
                return false;
            }
            const description = item.description();
            return description && description.equip === equip;
        })
            .sort((a, b) => calculateEquipItemScore(b) - calculateEquipItemScore(a));
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
    function getPossibleHandEquips(context, actionType, preferredDamageType, filterEquipped) {
        const items = getInventoryItemsWithUse(context, actionType, filterEquipped)
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
    exports.getPossibleHandEquips = getPossibleHandEquips;
    function getInventoryItemsWithEquipType(context, equipType) {
        return context.player.inventory.containedItems.filter(item => {
            const description = item.description();
            return description && description.equip === equipType;
        });
    }
    exports.getInventoryItemsWithEquipType = getInventoryItemsWithEquipType;
    function hasInventoryItemForAction(context, actionType) {
        return context.player.inventory.containedItems
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
    exports.hasInventoryItemForAction = hasInventoryItemForAction;
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
                        return damageTypesB - damageTypesA;
                    }
                    return descriptionB.attack - descriptionA.attack;
                }
            }
            return a.minDur !== undefined && b.minDur !== undefined ? b.minDur - a.minDur : 0;
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
            .sort((a, b) => context.player.inventory.containedItems.indexOf(a) - context.player.inventory.containedItems.indexOf(b));
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
        const result = new Set();
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
                                result.add(itemType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBcUJBLFNBQWdCLGFBQWEsQ0FBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxvQkFBNkI7UUFDN0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQ0FBNEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxFQUFFO1lBQzlILElBQUksVUFBVSxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN4RTtZQUVELElBQUksa0JBQWtCLEtBQUsscUJBQWEsQ0FBQyxTQUFTLEVBQUU7Z0JBRW5ELE9BQU8sSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO2FBQ3hDO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztRQUN0RCxNQUFNLFNBQVMsR0FBZTtZQUM3QixjQUFjLEVBQUUsS0FBSztZQUNyQixVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDaEMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUMsSUFBSSxvQkFBb0IsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBRTVG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