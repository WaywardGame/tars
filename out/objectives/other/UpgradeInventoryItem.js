define(["require", "exports", "game/item/IItem", "game/item/ItemDescriptions", "utilities/enum/Enums", "../../core/objective/IObjective", "../../core/ITars", "../../core/objective/Objective", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemForAction"], function (require, exports, IItem_1, ItemDescriptions_1, Enums_1, IObjective_1, ITars_1, Objective_1, AcquireItem_1, AcquireItemForAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UpgradeInventoryItem extends Objective_1.default {
        constructor(upgrade, fromItemTypes = new Set()) {
            super();
            this.upgrade = upgrade;
            this.fromItemTypes = fromItemTypes;
        }
        getIdentifier() {
            return `UpgradeInventoryItem:${this.upgrade}`;
        }
        getStatus() {
            return `Upgrading ${this.upgrade}`;
        }
        async execute(context) {
            const item = context.inventory[this.upgrade];
            if (!item || Array.isArray(item)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const description = item.description;
            if (!description) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const currentWorth = description.worth;
            if (currentWorth === undefined) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const itemInfo = ITars_1.inventoryItemInfo[this.upgrade];
            const flags = itemInfo.flags ?? ITars_1.InventoryItemFlag.PreferHigherWorth;
            let isUpgrade;
            if (typeof (flags) === "object") {
                switch (flags.flag) {
                    case ITars_1.InventoryItemFlag.PreferHigherActionBonus:
                        const currentActionTier = item.getItemUseBonus(flags.option);
                        isUpgrade = (itemType) => {
                            const actionTier = ItemDescriptions_1.itemDescriptions[itemType]?.actionTier?.[flags.option];
                            return actionTier !== undefined && actionTier > currentActionTier;
                        };
                        break;
                    case ITars_1.InventoryItemFlag.PreferHigherTier:
                        const currentItemTier = item.description?.tier?.[flags.option];
                        isUpgrade = (itemType) => {
                            const tier = ItemDescriptions_1.itemDescriptions[itemType]?.tier?.[flags.option];
                            return tier !== undefined && currentItemTier !== undefined && tier > currentItemTier;
                        };
                        break;
                }
            }
            if (!isUpgrade) {
                isUpgrade = (itemType) => {
                    const worth = ItemDescriptions_1.itemDescriptions[itemType]?.worth;
                    return worth !== undefined && currentWorth !== undefined && worth > currentWorth;
                };
            }
            if (itemInfo.itemTypes) {
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    if (context.island.items.isGroup(itemTypeOrGroup)) {
                        const groupItems = context.island.items.getGroupItems(itemTypeOrGroup);
                        for (const groupItemType of groupItems) {
                            this.addUpgradeObjectives(objectivePipelines, groupItemType, item, isUpgrade);
                        }
                    }
                    else {
                        this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, item, isUpgrade);
                    }
                }
            }
            if (itemInfo.equipType) {
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = ItemDescriptions_1.itemDescriptions[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        this.addUpgradeObjectives(objectivePipelines, itemType, item, isUpgrade);
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(context, actionType)) {
                        this.addUpgradeObjectives(objectivePipelines, itemType, item, isUpgrade);
                    }
                }
            }
            return objectivePipelines;
        }
        addUpgradeObjectives(objectives, itemType, currentItem, isUpgrade) {
            if (currentItem.type !== itemType && !this.fromItemTypes.has(itemType) && isUpgrade(itemType)) {
                objectives.push([new AcquireItem_1.default(itemType)]);
            }
        }
    }
    exports.default = UpgradeInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QixFQUFtQixnQkFBK0IsSUFBSSxHQUFHLEVBQUU7WUFDckgsS0FBSyxFQUFFLENBQUM7WUFEb0IsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7WUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQTJCO1FBRXRILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN2QyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxR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