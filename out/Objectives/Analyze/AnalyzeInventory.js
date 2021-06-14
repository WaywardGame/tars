define(["require", "exports", "game/entity/action/actions/ProtectItem", "../../IObjective", "../../ITars", "../../Objective", "../../utilities/Item"], function (require, exports, ProtectItem_1, IObjective_1, ITars_1, Objective_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AnalyzeInventory extends Objective_1.default {
        getIdentifier() {
            return "AnalyzeInventory";
        }
        async execute(context) {
            var _a;
            if (context.calculatingDifficulty) {
                return 0;
            }
            const keys = Object.keys(ITars_1.inventoryItemInfo);
            for (const key of keys) {
                const itemInfo = ITars_1.inventoryItemInfo[key];
                const itemOrItems = context.inventory[key];
                if (itemOrItems !== undefined) {
                    let invalidate = false;
                    if (Array.isArray(itemOrItems)) {
                        const validItems = itemOrItems.filter(item => this.isValid(context, itemInfo, item));
                        if (itemOrItems.length !== validItems.length) {
                            if (validItems.length > 0) {
                                this.log.info(`"${key}" changed from ${itemOrItems.map(item => item).join(", ")} to ${validItems.map(item => item).join(", ")}`);
                                context.inventory[key] = validItems;
                            }
                            else {
                                invalidate = true;
                            }
                        }
                    }
                    else if (!this.isValid(context, itemInfo, itemOrItems)) {
                        invalidate = true;
                    }
                    if (invalidate) {
                        context.inventory[key] = undefined;
                        this.log.info(`"${key}" was removed`);
                    }
                }
                const flags = (_a = itemInfo.flags) !== null && _a !== void 0 ? _a : ITars_1.InventoryItemFlag.PreferHigherWorth;
                const items = AnalyzeInventory.getItems(context, itemInfo);
                if (items.size > 0) {
                    const flag = typeof (flags) === "object" ? flags.flag : flags;
                    const flagOption = typeof (flags) === "object" ? flags.option : undefined;
                    const sortedItems = Array.from(items).sort((itemA, itemB) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        const descriptionA = itemA.description();
                        const descriptionB = itemB.description();
                        if (!descriptionA || !descriptionB) {
                            return -1;
                        }
                        switch (flag) {
                            case ITars_1.InventoryItemFlag.PreferHigherWorth:
                                return ((_a = descriptionB.worth) !== null && _a !== void 0 ? _a : 0) - ((_b = descriptionA.worth) !== null && _b !== void 0 ? _b : 0);
                            case ITars_1.InventoryItemFlag.PreferHigherActionBonus:
                                return itemB.getItemUseBonus(flagOption) - itemA.getItemUseBonus(flagOption);
                            case ITars_1.InventoryItemFlag.PreferHigherTier:
                                return ((_d = (_c = descriptionB.tier) === null || _c === void 0 ? void 0 : _c[flagOption]) !== null && _d !== void 0 ? _d : 0) - ((_f = (_e = descriptionA.tier) === null || _e === void 0 ? void 0 : _e[flagOption]) !== null && _f !== void 0 ? _f : 0);
                            case ITars_1.InventoryItemFlag.PreferHigherDurability:
                                return ((_g = itemB.minDur) !== null && _g !== void 0 ? _g : 999999) - ((_h = itemA.minDur) !== null && _h !== void 0 ? _h : 999999);
                            case ITars_1.InventoryItemFlag.PreferHigherDecay:
                                return ((_j = itemB.decay) !== null && _j !== void 0 ? _j : 999999) - ((_k = itemA.decay) !== null && _k !== void 0 ? _k : 999999);
                            case ITars_1.InventoryItemFlag.PreferLowerWeight:
                                return itemA.getTotalWeight() - itemB.getTotalWeight();
                        }
                    });
                    if (itemInfo.allowMultiple !== undefined) {
                        const newItems = sortedItems.slice(0, Math.min(sortedItems.length, itemInfo.allowMultiple));
                        const existingItems = context.inventory[key];
                        if (existingItems === undefined || (newItems.join(",") !== existingItems.join(","))) {
                            this.log.info(`Found "${key}" - ${newItems.map(item => item).join(", ")} `);
                        }
                        context.inventory[key] = newItems;
                        if (itemInfo.protect) {
                            if (existingItems) {
                                for (const item of existingItems) {
                                    if (item.isValid() && item.protected && !newItems.includes(item)) {
                                        ProtectItem_1.default.execute(context.player, item, false);
                                    }
                                }
                            }
                            for (const item of newItems) {
                                if (item.isValid() && !item.protected) {
                                    ProtectItem_1.default.execute(context.player, item, true);
                                }
                            }
                        }
                    }
                    else {
                        const currentItem = context.inventory[key];
                        const item = sortedItems[0];
                        if (currentItem !== item) {
                            if (itemInfo.protect && currentItem && currentItem.isValid() && currentItem.protected) {
                                ProtectItem_1.default.execute(context.player, currentItem, false);
                            }
                            context.inventory[key] = item;
                            this.log.info(`Found "${key}" - ${item}`);
                            if (itemInfo.protect) {
                                ProtectItem_1.default.execute(context.player, item, true);
                            }
                        }
                    }
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
        static getItems(context, itemInfo) {
            const items = new Set();
            if (itemInfo.itemTypes) {
                for (const itemTypeOrGroup of itemInfo.itemTypes) {
                    if (itemManager.isGroup(itemTypeOrGroup)) {
                        items.addFrom(itemManager.getItemsInContainerByGroup(context.player.inventory, itemTypeOrGroup));
                    }
                    else {
                        items.addFrom(itemManager.getItemsInContainerByType(context.player.inventory, itemTypeOrGroup));
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const useType of itemInfo.actionTypes) {
                    items.addFrom(Item_1.itemUtilities.getInventoryItemsWithUse(context, useType));
                }
            }
            if (itemInfo.equipType) {
                items.addFrom(Item_1.itemUtilities.getInventoryItemsWithEquipType(context, itemInfo.equipType));
            }
            if (itemInfo.requiredMinDur !== undefined) {
                for (const item of Array.from(items)) {
                    if (item.minDur !== undefined && item.minDur < itemInfo.requiredMinDur) {
                        items.delete(item);
                    }
                }
            }
            return items;
        }
        isValid(context, itemInfo, item) {
            if (!item.isValid()) {
                return false;
            }
            if (itemInfo.requiredMinDur !== undefined && item.minDur !== undefined && item.minDur < itemInfo.requiredMinDur) {
                return false;
            }
            if (itemManager.isContainableInContainer(item, context.player.inventory)) {
                return true;
            }
            if (itemInfo.allowInChests && context.base.chest.some(chest => itemManager.isContainableInContainer(item, chest))) {
                return true;
            }
            if (itemInfo.allowOnTiles && itemManager.isTileContainer(item.containedWithin)) {
                return true;
            }
            return false;
        }
    }
    exports.default = AnalyzeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBaUIsQ0FBaUMsQ0FBQztZQUM1RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxRQUFRLEdBQUcseUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTNDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFDOUIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUV2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7d0JBQy9CLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFFckYsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7NEJBQzdDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0NBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxrQkFBa0IsV0FB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