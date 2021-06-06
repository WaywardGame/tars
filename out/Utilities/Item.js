define(["require", "exports", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemRecipeRequirementChecker", "game/item/Items", "utilities/enum/Enums", "game/tile/Terrains", "../ITars", "./Doodad", "./Base"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, Terrains_1, ITars_1, Doodad_1, Base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.itemUtilities = void 0;
    const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
    class ItemUtilities {
        constructor() {
            this.foodItemTypes = this.getFoodItemTypes();
            this.disassembleSearchCache = new Map();
        }
        clearCache() {
            this.itemCache = undefined;
            this.disassembleSearchCache.clear();
        }
        getDisassembleSearch(context, itemType) {
            let search = this.disassembleSearchCache.get(itemType);
            if (search === undefined) {
                search = [];
                if (this.itemCache === undefined) {
                    const baseTileItems = Base_1.baseUtilities.getTileItemsNearBase(context);
                    const baseChestItems = context.base.chest
                        .map(chest => itemManager.getItemsInContainer(chest, true))
                        .flat();
                    const inventoryItems = itemManager.getItemsInContainer(context.player.inventory, true);
                    this.itemCache = baseTileItems.concat(baseChestItems).concat(inventoryItems);
                }
                for (const item of this.itemCache) {
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
                    if (context.isReservedItem(item)) {
                        return false;
                    }
                    if (!allowInventoryItems && this.isInventoryItem(context, item)) {
                        return false;
                    }
                }
                return true;
            });
            const items = context.player.inventory.containedItems
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
        getItemInInventory(context, itemTypeSearch) {
            return this.getItemInContainer(context, context.player.inventory, itemTypeSearch);
        }
        getItemInContainer(context, container, itemTypeSearch, allowInventoryItems) {
            const orderedItems = itemManager.getOrderedContainerItems(container);
            for (const item of orderedItems) {
                if (!allowInventoryItems && this.isInventoryItem(context, item)) {
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
        getBestTool(context, use, preferredDamageType) {
            let possibleEquips = this.getPossibleHandEquips(context, use, preferredDamageType);
            if (possibleEquips.length === 0 && preferredDamageType !== undefined) {
                possibleEquips = this.getPossibleHandEquips(context, use);
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
            return context.player.inventory.containedItems
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
            return context.player.inventory.containedItems
                .filter(item => {
                const description = item.description();
                return description && description.equip === equipType;
            });
        }
        hasInventoryItemForAction(context, actionType) {
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
        getInventoryItemsWithUse(context, use, filterEquipped) {
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
        getReservedItems(context) {
            return context.player.inventory.containedItems
                .filter(item => context.isReservedItem(item) && !this.isInventoryItem(context, item));
        }
        getUnusedItems(context, options = {}) {
            return context.player.inventory.containedItems
                .filter(item => {
                if (item.isEquipped() ||
                    ((!options.allowSailboat || item !== context.inventory.sailBoat) && this.isInventoryItem(context, item)) ||
                    (!options.allowReservedItems && context.isReservedItem(item))) {
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
        getAvailableInventoryWeight(context) {
            const items = context.player.inventory.containedItems
                .filter(item => this.isInventoryItem(context, item));
            const itemsWeight = items.reduce((a, b) => a + b.getTotalWeight(), 0);
            return context.player.stat.get(IStats_1.Stat.Weight).max - itemsWeight;
        }
        getSeeds(context) {
            return itemManager.getItemsInContainerByGroup(context.player.inventory, IItem_1.ItemTypeGroup.Seed, true)
                .filter(seed => seed.minDur !== undefined && seed.minDur > 0 && seed.type !== IItem_1.ItemType.GrassSeeds && seed.type !== IItem_1.ItemType.MapleSeeds);
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
    }
    exports.itemUtilities = new ItemUtilities();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBcUJBLE1BQU0sYUFBYSxHQUFHLENBQUMscUJBQWEsQ0FBQyxTQUFTLEVBQUUscUJBQWEsQ0FBQyxLQUFLLEVBQUUscUJBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVqSyxNQUFNLGFBQWE7UUFBbkI7WUFFaUIsa0JBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUd2QywyQkFBc0IsR0FBd0MsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQTZiMUYsQ0FBQztRQTNiTyxVQUFVO1lBQ2hCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQzNCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQyxDQUFDO1FBRU0sb0JBQW9CLENBQUMsT0FBZ0IsRUFBRSxRQUFrQjtZQUMvRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEVBQUUsQ0FBQztnQkFFWixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO29CQUNqQyxNQUFNLGFBQWEsR0FBRyxvQkFBYSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNsRSxNQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUs7eUJBQ3ZDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7eUJBQzFELElBQUksRUFBRSxD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