define(["require", "exports", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "item/IItem", "item/ItemRecipeRequirementChecker", "item/Items", "utilities/enum/Enums", "../ITars", "./Doodad"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, ITars_1, Doodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInventoryItemForDoodad = exports.getSeeds = exports.getAvailableInventoryWeight = exports.getUnusedItems = exports.getReservedItems = exports.getInventoryItemsWithUse = exports.getInventoryItemsWithEquipType = exports.getPossibleHandEquips = exports.estimateDamageModifier = exports.calculateEquipItemScore = exports.getBestEquipment = exports.getBestActionItem = exports.canDrinkItem = exports.isInventoryItem = exports.getItemInContainer = exports.getItemInInventory = exports.processRecipe = void 0;
    function processRecipe(context, recipe, useIntermediateChest) {
        const checker = new ItemRecipeRequirementChecker_1.default(context.player, recipe, true, false, (item, isConsumed) => !isConsumed || (!context.isReservedItem(item) && !isInventoryItem(context, item)));
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
            if (context.inventory[key] === item) {
                return true;
            }
        }
        return false;
    }
    exports.isInventoryItem = isInventoryItem;
    function canDrinkItem(item) {
        const waterContainerDescription = item.description();
        return (waterContainerDescription.use && waterContainerDescription.use.indexOf(IAction_1.ActionType.DrinkItem) !== -1) ? true : false;
    }
    exports.canDrinkItem = canDrinkItem;
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
            return description.use && description.use.indexOf(use) !== -1;
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
            if (description && description.use && (description.use.indexOf(IAction_1.ActionType.GatherWater) !== -1 || description.use.indexOf(IAction_1.ActionType.DrinkItem) !== -1)) {
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
        const matchingItems = itemManager.getItemsInContainer(context.player.inventory, true).filter(item => itemTypes.indexOf(item.type) !== -1);
        return matchingItems[0];
    }
    exports.getInventoryItemForDoodad = getInventoryItemForDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBa0JBLFNBQWdCLGFBQWEsQ0FBQyxPQUFnQixFQUFFLE1BQWUsRUFBRSxvQkFBNkI7UUFDN0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQ0FBNEIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQzFHLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEYsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO1FBQ3RELE1BQU0sU0FBUyxHQUFlO1lBQzdCLGNBQWMsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjO1lBQ3ZELGNBQWMsRUFBRSxLQUFLO1lBQ3JCLFVBQVUsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUNoQyxDQUFDO1FBQ0YsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQyxJQUFJLG9CQUFvQixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUU7WUFFNUYsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbEU7UUFFRCxPQUFPLE9B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