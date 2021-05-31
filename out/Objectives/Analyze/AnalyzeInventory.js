define(["require", "exports", "game/entity/action/actions/ProtectItem", "../../IObjective", "../../ITars", "../../Objective", "../../utilities/Item"], function (require, exports, ProtectItem_1, IObjective_1, ITars_1, Objective_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AnalyzeInventory extends Objective_1.default {
        getIdentifier() {
            return "AnalyzeInventory";
        }
        async execute(context) {
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
                const flags = itemInfo.flags !== undefined ? itemInfo.flags : ITars_1.InventoryItemFlag.PreferHigherWorth;
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
                        items.addFrom(Item_1.getInventoryItemsWithUse(context, useType));
                    }
                }
                if (itemInfo.equipType) {
                    items.addFrom(Item_1.getInventoryItemsWithEquipType(context, itemInfo.equipType));
                }
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
                            this.log.info(`Found "${key}" - ${item} `);
                            if (itemInfo.protect) {
                                ProtectItem_1.default.execute(context.player, item, true);
                            }
                        }
                    }
                }
            }
            this.log.debug(context.inventory);
            return IObjective_1.ObjectiveResult.Ignore;
        }
        isValid(context, itemInfo, item) {
            if (!item.isValid()) {
                return false;
            }
            if (itemManager.isContainableInContainer(item, context.player.inventory)) {
                return true;
            }
            if (itemInfo.allowInChests) {
                return context.base.chest.some(chest => itemManager.isContainableInContainer(item, chest));
            }
            return false;
        }
    }
    exports.default = AnalyzeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFTQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFpQixDQUFpQyxDQUFDO1lBQzVFLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixNQUFNLFFBQVEsR0FBRyx5QkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFM0MsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO29CQUM5QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBRXZCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDL0IsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUVyRixJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLE1BQU0sRUFBRTs0QkFDN0MsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQ0FDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFrQixXQUFX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