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
            const description = item.description();
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
                        const currentItemTier = item.description()?.tier?.[flags.option];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QixFQUFtQixnQkFBK0IsSUFBSSxHQUFHLEVBQUU7WUFDckgsS0FBSyxFQUFFLENBQUM7WUFEb0IsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7WUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQTJCO1FBRXRILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2pCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxN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