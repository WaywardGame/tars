define(["require", "exports", "game/entity/action/actions/ProtectItem", "../../IObjective", "../../ITars", "../../Objective", "../../utilities/Item"], function (require, exports, ProtectItem_1, IObjective_1, ITars_1, Objective_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AnalyzeInventory extends Objective_1.default {
        getIdentifier() {
            return "AnalyzeInventory";
        }
        getStatus() {
            return "Analyzing inventory";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHFCQUFxQixDQUFDO1FBQzlCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtnQkFDbEMsT0FBTyxDQUFDLENBQUM7YUFDVDtZQUVELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQWlCLENBQWlDLENBQUM7WUFDNUUsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7Z0JBQ3ZCLE1BQU0sUUFBUSxHQUFHLHlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUUzQyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQzlCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFFdkIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUMvQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7d0JBRXJGLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsTUFBTSxFQUFFOzRCQUM3QyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dDQUMxQixJQUFJLENB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