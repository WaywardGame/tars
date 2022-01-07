define(["require", "exports", "game/item/IItem", "game/item/Items", "utilities/enum/Enums", "../../core/objective/IObjective", "../../core/ITars", "../../core/objective/Objective", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemForAction"], function (require, exports, IItem_1, Items_1, Enums_1, IObjective_1, ITars_1, Objective_1, AcquireItem_1, AcquireItemForAction_1) {
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
            var _a, _b, _c;
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
            const flags = (_a = itemInfo.flags) !== null && _a !== void 0 ? _a : ITars_1.InventoryItemFlag.PreferHigherWorth;
            let isUpgrade;
            if (typeof (flags) === "object") {
                switch (flags.flag) {
                    case ITars_1.InventoryItemFlag.PreferHigherActionBonus:
                        const currentActionTier = item.getItemUseBonus(flags.option);
                        isUpgrade = (itemType) => {
                            var _a, _b;
                            const actionTier = (_b = (_a = Items_1.default[itemType]) === null || _a === void 0 ? void 0 : _a.actionTier) === null || _b === void 0 ? void 0 : _b[flags.option];
                            return actionTier !== undefined && actionTier > currentActionTier;
                        };
                        break;
                    case ITars_1.InventoryItemFlag.PreferHigherTier:
                        const currentItemTier = (_c = (_b = item.description()) === null || _b === void 0 ? void 0 : _b.tier) === null || _c === void 0 ? void 0 : _c[flags.option];
                        isUpgrade = (itemType) => {
                            var _a, _b;
                            const tier = (_b = (_a = Items_1.default[itemType]) === null || _a === void 0 ? void 0 : _a.tier) === null || _b === void 0 ? void 0 : _b[flags.option];
                            return tier !== undefined && currentItemTier !== undefined && tier > currentItemTier;
                        };
                        break;
                }
            }
            if (!isUpgrade) {
                isUpgrade = (itemType) => {
                    var _a;
                    const worth = (_a = Items_1.default[itemType]) === null || _a === void 0 ? void 0 : _a.worth;
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
                    const description = Items_1.default[itemType];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFlQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QixFQUFtQixnQkFBK0IsSUFBSSxHQUFHLEVBQUU7WUFDckgsS0FBSyxFQUFFLENBQUM7WUFEb0IsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7WUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQTJCO1FBRXRILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sd0JBQXdCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMvQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sYUFBYSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7O1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN2QyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMs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