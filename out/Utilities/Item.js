define(["require", "exports", "game/entity/action/IAction", "game/entity/IEntity", "game/entity/IHuman", "game/entity/IStats", "game/item/IItem", "game/item/ItemRecipeRequirementChecker", "game/item/Items", "utilities/enum/Enums", "game/tile/Terrains", "../ITars", "./Doodad"], function (require, exports, IAction_1, IEntity_1, IHuman_1, IStats_1, IItem_1, ItemRecipeRequirementChecker_1, Items_1, Enums_1, Terrains_1, ITars_1, Doodad_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.itemUtilities = void 0;
    const goodFoodItems = [IItem_1.ItemTypeGroup.Vegetable, IItem_1.ItemTypeGroup.Fruit, IItem_1.ItemTypeGroup.Bait, IItem_1.ItemTypeGroup.CookedFood, IItem_1.ItemTypeGroup.CookedMeat, IItem_1.ItemTypeGroup.Seed];
    class ItemUtilities {
        constructor() {
            this.foodItemTypes = this.getFoodItemTypes();
        }
        processRecipe(context, recipe, useIntermediateChest, allowInventoryItems) {
            const checker = new ItemRecipeRequirementChecker_1.default(context.player, recipe, true, false, (item, isConsumed, forItemTypeOrGroup) => {
                if (isConsumed) {
                    return !context.isReservedItem(item) && (allowInventoryItems || !this.isInventoryItem(context, item));
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
            return this.getItemInContainer(context, context.player.inventory, itemTypeSearch, true);
        }
        getItemInContainer(context, container, itemTypeSearch, excludeUsefulItems = true) {
            const orderedItems = itemManager.getOrderedContainerItems(container);
            for (const item of orderedItems) {
                if (excludeUsefulItems && this.isInventoryItem(context, item)) {
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
                    const item2 = this.getItemInContainer(context, item, itemTypeSearch, excludeUsefulItems);
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
        getUnusedItems(context, ignoreReserved = false) {
            return context.player.inventory.containedItems
                .filter(item => {
                if (item.isEquipped() || this.isInventoryItem(context, item) || (!ignoreReserved && context.isReservedItem(item))) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsaXRpZXMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBb0JBLE1BQU0sYUFBYSxHQUFHLENBQUMscUJBQWEsQ0FBQyxTQUFTLEVBQUUscUJBQWEsQ0FBQyxLQUFLLEVBQUUscUJBQWEsQ0FBQyxJQUFJLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxVQUFVLEVBQUUscUJBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVqSyxNQUFNLGFBQWE7UUFBbkI7WUFFaUIsa0JBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQTZYekQsQ0FBQztRQTFYTyxhQUFhLENBQUMsT0FBZ0IsRUFBRSxNQUFlLEVBQUUsb0JBQTZCLEVBQUUsbUJBQTZCO1lBQ25ILE1BQU0sT0FBTyxHQUFHLElBQUksc0NBQTRCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsRUFBRTtnQkFDOUgsSUFBSSxVQUFVLEVBQUU7b0JBQ2YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3RHO2dCQU9ELE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7WUFHSCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjO2lCQUNuRCxLQUFLLEVBQUU7aUJBQ1AsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxLQUFLLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENB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