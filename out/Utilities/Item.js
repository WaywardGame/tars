define(["require", "exports", "Enums", "utilities/enum/Enums", "item/Items", "./Logger", "item/ItemRecipeRequirementChecker", "../Helpers"], function (require, exports, Enums_1, Enums_2, Items_1, Logger_1, ItemRecipeRequirementChecker_1, Helpers_1) {
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
            if (description && description.use && (description.use.indexOf(Enums_1.ActionType.GatherWater) !== -1 || description.use.indexOf(Enums_1.ActionType.DrinkItem) !== -1)) {
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
                if (itemDescription && itemDescription.onUse && itemDescription.onUse[Enums_1.ActionType.Build] === dt) {
                    itemTypes.push(it);
                }
            }
        }
        const matchingItems = itemManager.getItemsInContainer(localPlayer.inventory, true).filter((item) => itemTypes.indexOf(item.type) !== -1);
        return matchingItems[0];
    }
    exports.getInventoryItemForDoodad = getInventoryItemForDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9VdGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7SUFFOUI7UUFDQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRkQsZ0RBRUM7SUFFRCx5QkFBZ0MsTUFBZTtRQUM5QyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVyQixZQUFHLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDL0I7SUFDRixDQUFDO0lBTkQsMENBTUM7SUFFRCx1QkFBOEIsU0FBMEIsRUFBRSxNQUFlLEVBQUUsVUFBbUI7UUFDN0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxzQ0FBNEIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBSWxGLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9GLE1BQU0sU0FBUyxHQUFlO1lBQzdCLGNBQWMsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWM7WUFDcEQsY0FBYyxFQUFFLEtBQUs7WUFDckIsVUFBVSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ2hDLENBQUM7UUFDRixPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRzFDLE9BQU8sT0FBTyxDQUFDO0lBQ2hCLENBQUM7SUFmRCxzQ0FlQztJ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