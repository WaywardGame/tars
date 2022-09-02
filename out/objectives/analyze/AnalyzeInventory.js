define(["require", "exports", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Item"], function (require, exports, ITars_1, IObjective_1, Objective_1, Item_1) {
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
                    }
                    else {
                        const currentItem = context.inventory[key];
                        const item = sortedItems[0];
                        if (currentItem !== item) {
                            context.inventory[key] = item;
                            this.log.info(`Found "${key}" - ${item}`);
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
                        items.addFrom(context.island.items.getItemsInContainerByGroup(context.human.inventory, itemTypeOrGroup, Item_1.defaultGetItemOptions));
                    }
                    else {
                        items.addFrom(context.island.items.getItemsInContainerByType(context.human.inventory, itemTypeOrGroup, Item_1.defaultGetItemOptions));
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
            for (const item of Array.from(items)) {
                if (!context.utilities.item.isAllowedToUseItem(context, item, false)) {
                    items.delete(item);
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
            if (!context.utilities.item.isAllowedToUseItem(context, item, false)) {
                return false;
            }
            if (context.island.items.isContainableInContainer(item, context.human.inventory)) {
                return true;
            }
            if (itemInfo.allowInChests && (context.base.chest.concat(context.base.intermediateChest).some(chest => context.island.items.isContainableInContainer(item, chest)))) {
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