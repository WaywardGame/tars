define(["require", "exports", "game/item/IItem", "game/item/Items", "utilities/enum/Enums", "../../IObjective", "../../ITars", "../../Objective", "../acquire/item/AcquireItem", "../acquire/item/AcquireItemForAction"], function (require, exports, IItem_1, Items_1, Enums_1, IObjective_1, ITars_1, Objective_1, AcquireItem_1, AcquireItemForAction_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UpgradeInventoryItem extends Objective_1.default {
        constructor(upgrade) {
            super();
            this.upgrade = upgrade;
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
            ;
            if (itemInfo.itemTypes) {
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes() : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    if (itemTypeOrGroup !== item.type) {
                        if (context.island.items.isGroup(itemTypeOrGroup)) {
                            const groupItems = context.island.items.getGroupItems(itemTypeOrGroup);
                            for (const groupItemType of groupItems) {
                                this.addUpgradeObjectives(objectivePipelines, groupItemType, isUpgrade);
                            }
                        }
                        else {
                            this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, isUpgrade);
                        }
                    }
                }
            }
            if (itemInfo.equipType) {
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = Items_1.default[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        this.addUpgradeObjectives(objectivePipelines, itemType, isUpgrade);
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(context, actionType)) {
                        this.addUpgradeObjectives(objectivePipelines, itemType, isUpgrade);
                    }
                }
            }
            return objectivePipelines;
        }
        addUpgradeObjectives(objectives, itemType, isUpgrade) {
            if (isUpgrade(itemType)) {
                objectives.push([new AcquireItem_1.default(itemType)]);
            }
        }
    }
    exports.default = UpgradeInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUUzRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCOztZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDakIsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDdkMsSUFBSSxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sUUFBUSxHQUFHLHlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVq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