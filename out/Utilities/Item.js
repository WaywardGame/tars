define(["require", "exports", "entity/action/IAction", "entity/IEntity", "entity/IHuman", "entity/IStats", "item/IItem", "item/ItemRecipeRequirementChecker", "item/Items", "utilities/enum/Enums", "../ITars", "./Doodad"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, ITars_1, Doodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
                        const damageTypesA = Enums_1.default.values(IEntity_1.DamageType).filter(type => (descriptionA.damageType & type) === type).length();
                        const damageTypesB = Enums_1.default.values(IEntity_1.DamageType).filter(type => (descriptionB.damageType & type) === type).length();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFrQkEsU0FBZ0IsYUFBYSxDQUFDLE9BQWdCLEVBQUUsTUFBZSxFQUFFLG9CQUE2QjtRQUM3RixNQUFNLE9BQU8sR0FBRyxJQUFJLHNDQUE0QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FDMUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVwRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7UUFDdEQsTUFBTSxTQUFTLEdBQWU7WUFDN0IsY0FBYyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWM7WUFDdkQsY0FBYyxFQUFFLEtBQUs7WUFDckIsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ2hDLENBQUM7UUFDRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFDLElBQUksb0JBQW9CLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRTtZQUU1RixPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNsRTtRQUVELE9BQU8sT0FB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