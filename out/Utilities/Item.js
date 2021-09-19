define(["require", "exports", "game/doodad/IDoodad", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemRecipeRequirementChecker", "game/item/Items", "utilities/enum/Enums", "game/tile/Terrains", "game/doodad/Doodads", "../ITars", "./Doodad", "./Base"], function (require, exports, IDoodad_1, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, Terrains_1, Doodads_1, ITars_1, Doodad_1, Base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.itemUtilities = void 0;
    class ItemUtilities {
        constructor() {
            this.foodItemTypes = this.getFoodItemTypes();
            this.seedItemTypes = this.getSeedItemTypes();
            this.disassembleSearchCache = new Map();
        }
        clearCache() {
            this.itemCache = undefined;
            this.disassembleSearchCache.clear();
        }
        getBaseItems(context) {
            if (this.itemCache === undefined) {
                const baseTileItems = Base_1.baseUtilities.getTileItemsNearBase(context);
                const baseChestItems = context.base.chest
                    .map(chest => itemManager.getItemsInContainer(chest, true))
                    .flat();
                const inventoryItems = itemManager.getItemsInContainer(context.player.inventory, true);
                this.itemCache = baseTileItems.concat(baseChestItems).concat(inventoryItems);
            }
            return this.itemCache;
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
                    if (!description || !description.disassemble || description.blockDisassembly) {
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
        processRecipe(context, recipe, useIntermediateChest, allowInventoryItems) {
            const checker = new ItemRecipeRequirementChecker_1.default(context.player, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
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
            checker.processContainer(container, true);
            if (useIntermediateChest && context.base.intermediateChest[0] && !checker.requirementsMet()) {
                checker.processContainer(context.base.intermediateChest[0], true);
            }
            return checker;
        }
        getItemsInInventory(context) {
            return itemManager.getItemsInContainer(context.player.inventory, true, true);
        }
        getItemInInventory(context, itemTypeSearch) {
            return this.getItemInContainer(context, context.player.inventory, itemTypeSearch);
        }
        getItemInContainer(context, container, itemTypeSearch, allowInventoryItems) {
            const orderedItems = itemManager.getOrderedContainerItems(container);
            for (const item of orderedItems) {
                if (!allowInventoryItems && this.isInventoryItem(context, item)) {
                    continue;
                }
                if (item.isProtected()) {
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
                    const item2 = this.getItemInContainer(context, item, itemTypeSearch, allowInventoryItems);
                    if (item2) {
                        return item2;
                    }
                }
            }
            return undefined;
        }
        isInventoryItem(context, item) {
            const keys = Object.keys(ITars_1.inventoryItemInfo);
            for (const key of keys) {
                const inventoryItem = context.inventory[key];
                if (Array.isArray(inventoryItem) ? inventoryItem.includes(item) : inventoryItem === item) {
                    return true;
                }
            }
            return false;
        }
        isSafeToDrinkItem(item) {
            return itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfMedicinalWater)
                || itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfDesalinatedWater)
                || itemManager.isInGroup(item.type, IItem_1.ItemTypeGroup.ContainerOfPurifiedFreshWater);
        }
        isDrinkableItem(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.DrinkItem);
        }
        canGatherWater(item) {
            return this.hasUseActionType(item, IAction_1.ActionType.GatherWater);
        }
        hasUseActionType(item, actionType) {
            var _a, _b;
            return ((_b = (_a = item.description()) === null || _a === void 0 ? void 0 : _a.use) === null || _b === void 0 ? void 0 : _b.includes(actionType)) ? true : false;
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
            var _a, _b;
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
                const skillType = (_b = (_a = description.gatherSkillUse) !== null && _a !== void 0 ? _a : description.skillUse) !== null && _b !== void 0 ? _b : IHuman_1.SkillType.Mining;
                const prefersBlunt = skillType === IHuman_1.SkillType.Mining;
                tool = this.getBestTool(context, IAction_1.ActionType.Gather, prefersBlunt ? IEntity_1.DamageType.Blunt : IEntity_1.DamageType.Slashing);
            }
            return tool;
        }
        getBestToolForTerrainGather(context, terrainType) {
            var _a;
            const terrainDescription = Terrains_1.default[terrainType];
            if (!terrainDescription) {
                return undefined;
            }
            let tool;
            if (terrainDescription.gather) {
                const prefersBlunt = ((_a = terrainDescription.gatherSkillUse) !== null && _a !== void 0 ? _a : IHuman_1.SkillType.Mining) === IHuman_1.SkillType.Mining;
                tool = this.getBestTool(context, IAction_1.ActionType.Gather, prefersBlunt ? IEntity_1.DamageType.Blunt : IEntity_1.DamageType.Slashing);
            }
            else {
                tool = this.getBestTool(context, IAction_1.ActionType.Dig);
            }
            return tool;
        }
        getBestEquipment(context, equip) {
            return this.getItemsInInventory(context)
                .filter(item => {
                if (item.type === IItem_1.ItemType.AnimalPelt) {
                    return false;
                }
                const description = item.description();
                return description && description.equip === equip;
            })
                .sort((a, b) => this.calculateEquipItemScore(b) - this.calculateEquipItemScore(a));
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
        getReservedItems(context) {
            return this.getItemsInInventory(context)
                .filter(item => context.isHardReservedItem(item) && !this.isInventoryItem(context, item));
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
            const items = this.getItemsInInventory(context)
                .filter(item => this.isInventoryItem(context, item));
            const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
            return context.player.stat.get(IStats_1.Stat.Weight).max - itemsWeight;
        }
        getSeeds(context) {
            const baseItems = this.getBaseItems(context);
            return baseItems.filter(item => item.minDur !== undefined &&
                item.minDur > 0 &&
                this.seedItemTypes.has(item.type));
        }
        getInventoryItemForDoodad(context, doodadTypeOrGroup) {
            const itemTypes = [];
            const doodadTypes = Doodad_1.doodadUtilities.getDoodadTypes(doodadTypeOrGroup);
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
        getFoodItemTypes() {
            const result = new Set();
            const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
            for (const itemTypeOrGroup of goodFoodItems) {
                const itemTypes = itemManager.isGroup(itemTypeOrGroup) ? itemManager.getGroupItems(itemTypeOrGroup) : [itemTypeOrGroup];
                for (const itemType of itemTypes) {
                    if (this.isHealthyToEat(itemType)) {
                        result.add(itemType);
                    }
                }
            }
            return result;
        }
        getSeedItemTypes() {
            var _a, _b;
            const result = new Set();
            const growingStages = Enums_1.default.values(IDoodad_1.GrowingStage);
            for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                const description = Items_1.itemDescriptions[itemType];
                const doodadType = (_a = description === null || description === void 0 ? void 0 : description.onUse) === null || _a === void 0 ? void 0 : _a[IAction_1.ActionType.Plant];
                if (doodadType === undefined) {
                    continue;
                }
                const gatherDoodadDescription = (_b = Doodads_1.default[doodadType]) === null || _b === void 0 ? void 0 : _b.gather;
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
            var _a, _b;
            const onEat = (_b = (_a = Items_1.itemDescriptions[itemType]) === null || _a === void 0 ? void 0 : _a.onUse) === null || _b === void 0 ? void 0 : _b[IAction_1.ActionType.Eat];
            return onEat !== undefined && onEat[0] > 1;
        }
    }
    exports.itemUtilities = new ItemUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBcUJBLE1BQU0sYUFBYTtRQUFuQjtZQUVpQixrQkFBYSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hDLGtCQUFhLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFHdkMsMkJBQXNCLEdBQXdDLElBQUksR0FBRyxFQUFFLENBQUM7UUE4ZjFGLENBQUM7UUE1Zk8sVUFBVTtZQUNoQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVNLFlBQVksQ0FBQyxPQUFnQjtZQUNuQyxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUNqQyxNQUFNLGFBQWEsR0FBRyxvQkFBYSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7cUJBQ3ZDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzFELElBQUksRUFBRSxDQUFDO2dCQUNULE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFdkYsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQzthQUM3RTtZQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRU0sb0JBQW9CLENBQUMsT0FBZ0IsRUFB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