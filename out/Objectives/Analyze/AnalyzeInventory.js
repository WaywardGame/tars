define(["require", "exports", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Item"], function (require, exports, IObjective_1, ITars_1, Objective_1, Item_1) {
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
                let itemOrItems = context.inventory[key];
                if (itemOrItems !== undefined) {
                    let invalidate = false;
                    if (Array.isArray(itemOrItems)) {
                        itemOrItems = context.inventory[key] = itemOrItems.filter(item => item.isValid() && itemManager.isContainableInContainer(item, context.player.inventory));
                        if (itemOrItems.length === 0) {
                            invalidate = true;
                        }
                    }
                    else if (!itemOrItems.isValid() || !itemManager.isContainableInContainer(itemOrItems, context.player.inventory)) {
                        invalidate = true;
                    }
                    if (invalidate) {
                        itemOrItems = context.inventory[key] = undefined;
                        this.log.info(`"${key}" was removed`);
                    }
                }
                const itemInfo = ITars_1.inventoryItemInfo[key];
                const flags = itemInfo.flags !== undefined ? itemInfo.flags : ITars_1.InventoryItemFlag.PreferHigherWorth;
                const items = [];
                if (itemInfo.itemTypes) {
                    for (const itemTypeOrGroup of itemInfo.itemTypes) {
                        if (itemManager.isGroup(itemTypeOrGroup)) {
                            items.push(...itemManager.getItemsInContainerByGroup(context.player.inventory, itemTypeOrGroup));
                        }
                        else {
                            items.push(...itemManager.getItemsInContainerByType(context.player.inventory, itemTypeOrGroup));
                        }
                    }
                }
                if (itemInfo.useTypes) {
                    for (const useType of itemInfo.useTypes) {
                        items.push(...Item_1.getInventoryItemsWithUse(context, useType));
                    }
                }
                if (itemInfo.equipType) {
                    items.push(...Item_1.getInventoryItemsWithEquipType(context, itemInfo.equipType));
                }
                if (items.length > 0) {
                    const sortedItems = items.sort((itemA, itemB) => {
                        const descriptionA = itemA.description();
                        const descriptionB = itemB.description();
                        if (!descriptionA || !descriptionB) {
                            return -1;
                        }
                        switch (flags) {
                            case ITars_1.InventoryItemFlag.PreferHigherWorth:
                                if (descriptionA.worth === undefined) {
                                    return -1;
                                }
                                if (descriptionB.worth === undefined) {
                                    return 1;
                                }
                                return descriptionA.worth < descriptionB.worth ? 1 : -1;
                            case ITars_1.InventoryItemFlag.PreferLowerWeight:
                                return itemA.getTotalWeight() > itemB.getTotalWeight() ? 1 : -1;
                            case ITars_1.InventoryItemFlag.PreferHigherDurability:
                                const minDurA = itemA.minDur !== undefined ? itemA.minDur : 999999;
                                const minDurB = itemB.minDur !== undefined ? itemB.minDur : 999999;
                                return minDurA < minDurB ? 1 : -1;
                            case ITars_1.InventoryItemFlag.PreferHigherDecay:
                                const decayA = itemA.decay !== undefined ? itemA.decay : 999999;
                                const decayB = itemB.decay !== undefined ? itemB.decay : 999999;
                                return decayA < decayB ? 1 : -1;
                        }
                    });
                    if (itemInfo.allowMultiple !== undefined) {
                        const newItems = sortedItems.slice(0, Math.min(sortedItems.length, itemInfo.allowMultiple));
                        const existingItems = context.inventory[key];
                        if (existingItems === undefined || (newItems.join(",") !== existingItems.join(","))) {
                            this.log.info(`Found "${key}" - ${newItems.map(item => item).join(", ")}`);
                        }
                        context.inventory[key] = newItems;
                    }
                    else {
                        const item = sortedItems[0];
                        if (context.inventory[key] !== item) {
                            context.inventory[key] = item;
                            this.log.info(`Found "${key}" - ${item}`);
                        }
                    }
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = AnalyzeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFpQixDQUFpQyxDQUFDO1lBQzVFLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV6QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQzlCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFFdkIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUMvQixXQUFXLEdBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQVMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUNuSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNsQjtxQkFFRDt5QkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxD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