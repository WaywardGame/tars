define(["require", "exports", "entity/action/ActionExecutor", "entity/action/IAction", "../../IObjective", "../../ITars", "../../Objective", "../../Utilities/Item"], function (require, exports, ActionExecutor_1, IAction_1, IObjective_1, ITars_1, Objective_1, Item_1) {
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
                if (itemInfo.actionTypes) {
                    for (const useType of itemInfo.actionTypes) {
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
                                const worthA = descriptionA.worth !== undefined ? descriptionA.worth : 0;
                                const worthB = descriptionB.worth !== undefined ? descriptionB.worth : 0;
                                return worthB - worthA;
                            case ITars_1.InventoryItemFlag.PreferLowerWeight:
                                return itemA.getTotalWeight() - itemB.getTotalWeight();
                            case ITars_1.InventoryItemFlag.PreferHigherDurability:
                                const minDurA = itemA.minDur !== undefined ? itemA.minDur : 999999;
                                const minDurB = itemB.minDur !== undefined ? itemB.minDur : 999999;
                                return minDurB - minDurA;
                            case ITars_1.InventoryItemFlag.PreferHigherDecay:
                                const decayA = itemA.decay !== undefined ? itemA.decay : 999999;
                                const decayB = itemB.decay !== undefined ? itemB.decay : 999999;
                                return decayB - decayA;
                        }
                    });
                    if (itemInfo.allowMultiple !== undefined) {
                        const newItems = sortedItems.slice(0, Math.min(sortedItems.length, itemInfo.allowMultiple));
                        const existingItems = context.inventory[key];
                        if (existingItems === undefined || (newItems.join(",") !== existingItems.join(","))) {
                            this.log.info(`Found "${key}" - ${newItems.map(item => item).join(", ")}`);
                        }
                        context.inventory[key] = newItems;
                        if (itemInfo.protect) {
                            if (existingItems) {
                                for (const item of existingItems) {
                                    if (item.isValid() && item.protected && !newItems.includes(item)) {
                                        ActionExecutor_1.default.get(IAction_1.ActionType.ProtectItem).execute(context.player, item, false);
                                    }
                                }
                            }
                            for (const item of newItems) {
                                if (item.isValid() && !item.protected) {
                                    ActionExecutor_1.default.get(IAction_1.ActionType.ProtectItem).execute(context.player, item, true);
                                }
                            }
                        }
                    }
                    else {
                        const currentItem = context.inventory[key];
                        const item = sortedItems[0];
                        if (currentItem !== item) {
                            if (itemInfo.protect && currentItem && currentItem.isValid() && currentItem.protected) {
                                ActionExecutor_1.default.get(IAction_1.ActionType.ProtectItem).execute(context.player, currentItem, false);
                            }
                            context.inventory[key] = item;
                            this.log.info(`Found "${key}" - ${item}`);
                            if (itemInfo.protect) {
                                ActionExecutor_1.default.get(IAction_1.ActionType.ProtectItem).execute(context.player, item, true);
                            }
                        }
                    }
                }
            }
            return IObjective_1.ObjectiveResult.Ignore;
        }
    }
    exports.default = AnalyzeInventory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl6ZUludmVudG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL0FuYWx5emUvQW5hbHl6ZUludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixnQkFBaUIsU0FBUSxtQkFBUztRQUUvQyxhQUFhO1lBQ25CLE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2xDLE9BQU8sQ0FBQyxDQUFDO2FBQ1Q7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUFpQixDQUFpQyxDQUFDO1lBQzVFLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV6QyxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQzlCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFFdkIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO3dCQUMvQixXQUFXLEdBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQVMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO3dCQUNuSyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM3QixVQUFVLEdBQUcsSUFBSSxDQUFDO3lCQUNsQjtxQkFFRDt5QkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxD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