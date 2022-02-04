define(["require", "exports", "game/entity/action/actions/ProtectItem", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, ProtectItem_1, ITars_1, IObjective_1, Objective_1) {
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
                const flags = itemInfo.flags ?? ITars_1.InventoryItemFlag.PreferHigherWorth;
                const items = AnalyzeInventory.getItems(context, itemInfo);
                if (items.size > 0) {
                    const flag = typeof (flags) === "object" ? flags.flag : flags;
                    const flagOption = typeof (flags) === "object" ? flags.option : undefined;
                    const sortedItems = Array.from(items).sort((itemA, itemB) => {
                        const descriptionA = itemA.description();
                        const descriptionB = itemB.description();
                        if (!descriptionA || !descriptionB) {
                            return -1;
                        }
                        switch (flag) {
                            case ITars_1.InventoryItemFlag.PreferHigherWorth:
                                return (descriptionB.worth ?? 0) - (descriptionA.worth ?? 0);
                            case ITars_1.InventoryItemFlag.PreferHigherActionBonus:
                                return itemB.getItemUseBonus(flagOption) - itemA.getItemUseBonus(flagOption);
                            case ITars_1.InventoryItemFlag.PreferHigherTier:
                                return (descriptionB.tier?.[flagOption] ?? 0) - (descriptionA.tier?.[flagOption] ?? 0);
                            case ITars_1.InventoryItemFlag.PreferHigherDurability:
                                return (itemB.minDur ?? 999999) - (itemA.minDur ?? 999999);
                            case ITars_1.InventoryItemFlag.PreferHigherDecay:
                                return (itemB.decay ?? 999999) - (itemA.decay ?? 999999);
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
                                        ProtectItem_1.default.execute(context.actionExecutor, item, false);
                                    }
                                }
                            }
                            for (const item of newItems) {
                                if (item.isValid() && !item.protected) {
                                    ProtectItem_1.default.execute(context.actionExecutor, item, true);
                                }
                            }
                        }
                    }
                    else {
                        const currentItem = context.inventory[key];
                        const item = sortedItems[0];
                        if (currentItem !== item) {
                            if (itemInfo.protect && currentItem && currentItem.isValid() && currentItem.protected) {
                                ProtectItem_1.default.execute(context.actionExecutor, currentItem, false);
                            }
                            context.inventory[key] = item;
                            this.log.info(`Found "${key}" - ${item}`);
                            if (itemInfo.protect) {
                                ProtectItem_1.default.execute(context.actionExecutor, item, true);
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
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    if (context.island.items.isGroup(itemTypeOrGroup)) {
                        items.addFrom(context.island.items.getItemsInContainerByGroup(context.human.inventory, itemTypeOrGroup));
                    }
                    else {
                        items.addFrom(context.island.items.getItemsInContainerByType(context.human.inventory, itemTypeOrGroup));
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const useType of itemInfo.actionTypes) {
                    items.addFrom(context.utilities.item.getInventoryItemsWithUse(context, useType));
                }
            }
            if (itemInfo.equipType) {
                items.addFrom(context.utilities.item.getInventoryItemsWithEquipType(context, itemInfo.equipType));
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
            if (context.island.items.isContainableInContainer(item, context.human.inventory)) {
                return true;
            }
            if (itemInfo.allowInChests && context.base.chest.some(chest => context.island.items.isContainableInContainer(item, chest))) {
                return true;
            }
            if (itemInfo.allowOnTiles && context.island.items.isTileContainer(item.containedWithin)) {
                return true;
            }
            return false;
        }
    }
    exports.default = AnalyzeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHFCQUFxQixDQUFDO1FBQzlCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUNsQyxPQUFPLENBQUMsQ0FBQzthQUNUO1lBRUQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBaUIsQ0FBaUMsQ0FBQztZQUM1RSxLQUFLLE1BQU0sR0FBRyxJQUFJLElBQUksRUFBRTtnQkFDdkIsTUFBTSxRQUFRLEdBQUcseUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTNDLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtvQkFDOUIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUV2QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7d0JBQy9CLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFFckYsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQyxNQUFNLEVBQUU7NEJBQzdDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0NBQzFCLElBQUksQ0FB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