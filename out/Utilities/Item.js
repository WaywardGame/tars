define(["require", "exports", "action/IAction", "Enums", "utilities/enum/Enums", "item/Items", "./Logger", "item/ItemRecipeRequirementChecker", "../Helpers"], function (require, exports, IAction_1, Enums_1, Enums_2, Items_1, Logger_1, ItemRecipeRequirementChecker_1, Helpers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const recipes = [];
    function resetTargetRecipes() {
        recipes.length = 0;
    }
    exports.resetTargetRecipes = resetTargetRecipes;
    function addTargetRecipe(recipe) {
        if (recipes.indexOf(recipe) === -1) {
            recipes.push(recipe);
            Logger_1.log("addTargetRecipe", recipe);
        }
    }
    exports.addTargetRecipe = addTargetRecipe;
    function processRecipe(inventory, recipe, trackItems) {
        const checker = new ItemRecipeRequirementChecker_1.default(localPlayer, recipe, trackItems);
        const items = localPlayer.inventory.containedItems.filter(i => !isInventoryItem(inventory, i));
        const container = {
            weightCapacity: localPlayer.inventory.weightCapacity,
            containedItems: items,
            itemOrders: items.map(i => i.id)
        };
        checker.processContainer(container, true);
        return checker;
    }
    exports.processRecipe = processRecipe;
    function isUsedByTargetRecipe(inventory, item) {
        for (const recipe of recipes) {
            const checker = processRecipe(inventory, recipe, true);
            if (checker.itemBaseComponent === item) {
                return true;
            }
            for (const requiredItem of checker.itemComponentsRequired) {
                if (requiredItem === item) {
                    return true;
                }
            }
            for (const consumedItem of checker.itemComponentsConsumed) {
                if (consumedItem === item) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isUsedByTargetRecipe = isUsedByTargetRecipe;
    function getItemInInventory(inventory, itemTypeSearch, excludeUsefulItems = true) {
        return getItemInContainer(inventory, localPlayer.inventory, itemTypeSearch, excludeUsefulItems);
    }
    exports.getItemInInventory = getItemInInventory;
    function getItemInContainer(inventory, container, itemTypeSearch, excludeUsefulItems = true) {
        const orderedItems = itemManager.getOrderedContainerItems(container);
        for (const item of orderedItems) {
            if (excludeUsefulItems && isInventoryItem(inventory, item)) {
                continue;
            }
            if (item.type === itemTypeSearch) {
                return item;
            }
            const description = Items_1.default[item.type];
            if (description && description.weightCapacity !== undefined) {
                const item2 = getItemInContainer(inventory, item, itemTypeSearch, excludeUsefulItems);
                if (item2) {
                    return item2;
                }
            }
        }
        return undefined;
    }
    exports.getItemInContainer = getItemInContainer;
    function isInventoryItem(inventory, item) {
        return Object.keys(inventory).findIndex(key => {
            const itemOrItems = inventory[key];
            if (Array.isArray(itemOrItems)) {
                return itemOrItems.indexOf(item) !== -1;
            }
            return itemOrItems === item;
        }) !== -1;
    }
    exports.isInventoryItem = isInventoryItem;
    function getBestActionItem(use, preferredDamageType) {
        let possibleEquips = getPossibleHandEquips(use, preferredDamageType);
        if (possibleEquips.length === 0) {
            possibleEquips = getPossibleHandEquips(use);
        }
        if (possibleEquips.length > 0) {
            return possibleEquips[0];
        }
        return undefined;
    }
    exports.getBestActionItem = getBestActionItem;
    function getBestEquipment(equip) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (item.type === Enums_1.ItemType.AnimalPelt) {
                return false;
            }
            const description = item.description();
            return description && description.equip === equip;
        }).sort((a, b) => calculateEquipItemScore(a) < calculateEquipItemScore(b) ? 1 : -1);
    }
    exports.getBestEquipment = getBestEquipment;
    function calculateEquipItemScore(item) {
        const description = item.description();
        if (!description || !description.defense) {
            return 0;
        }
        let score = description.defense.base;
        const resists = description.defense.resist;
        const vulns = description.defense.vulnerable;
        for (const damageType of Enums_2.default.values(Enums_1.DamageType)) {
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
    function getPossibleHandEquips(use, preferredDamageType, filterEquipped) {
        return getInventoryItemsWithUse(use, filterEquipped).filter(item => {
            const description = item.description();
            return description && description.equip === Enums_1.EquipType.Held &&
                (preferredDamageType === undefined || (description.damageType !== undefined && ((description.damageType & preferredDamageType) !== 0)));
        }).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
    }
    exports.getPossibleHandEquips = getPossibleHandEquips;
    function getInventoryItemsWithUse(use, filterEquipped) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (filterEquipped && item.isEquipped()) {
                return false;
            }
            const description = item.description();
            return description && description.use && description.use.indexOf(use) !== -1;
        }).sort((a, b) => a.minDur !== undefined && b.minDur !== undefined ? (a.minDur < b.minDur ? 1 : -1) : 0);
    }
    exports.getInventoryItemsWithUse = getInventoryItemsWithUse;
    function getUnusedItems(inventory) {
        return localPlayer.inventory.containedItems.filter(item => {
            if (item.isEquipped() || isInventoryItem(inventory, item) || isUsedByTargetRecipe(inventory, item)) {
                return false;
            }
            const description = item.description();
            if (description && description.use && (description.use.indexOf(IAction_1.ActionType.GatherWater) !== -1 || description.use.indexOf(IAction_1.ActionType.DrinkItem) !== -1)) {
                return false;
            }
            return true;
        }).sort((a, b) => a.weight < b.weight ? 1 : -1);
    }
    exports.getUnusedItems = getUnusedItems;
    function getSeeds() {
        return itemManager.getItemsInContainerByGroup(localPlayer.inventory, Enums_1.ItemTypeGroup.Seed, true).filter(seed => seed.minDur !== undefined && seed.minDur > 0);
    }
    exports.getSeeds = getSeeds;
    function getInventoryItemForDoodad(doodadTypeOrGroup) {
        const itemTypes = [];
        const doodadTypes = Helpers_1.getDoodadTypes(doodadTypeOrGroup);
        for (const dt of doodadTypes) {
            for (const it of Enums_2.default.values(Enums_1.ItemType)) {
                const itemDescription = Items_1.default[it];
                if (itemDescription && itemDescription.onUse && itemDescription.onUse[IAction_1.ActionType.Build] === dt) {
                    itemTypes.push(it);
                }
            }
        }
        const matchingItems = itemManager.getItemsInContainer(localPlayer.inventory, true).filter((item) => itemTypes.indexOf(item.type) !== -1);
        return matchingItems[0];
    }
    exports.getInventoryItemForDoodad = getInventoryItemForDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7SUFFOUIsU0FBZ0Isa0JBQWtCO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFGRCxnREFFQztJQUVELFNBQWdCLGVBQWUsQ0FBQyxNQUFlO1FBQzlDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXJCLFlBQUcsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMvQjtJQUNGLENBQUM7SUFORCwwQ0FNQztJQUVELFNBQWdCLGFBQWEsQ0FBQyxTQUEwQixFQUFFLE1BQWUsRUFBRSxVQUFtQjtRQUM3RixNQUFNLE9BQU8sR0FBRyxJQUFJLHNDQUE0QixDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFJbEYsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0YsTUFBTSxTQUFTLEdBQWU7WUFDN0IsY0FBYyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYztZQUNwRCxjQUFjLEVBQUUsS0FBSztZQUNyQixVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDaEMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFHMUMsT0FBTyxP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