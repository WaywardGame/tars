define(["require", "exports", "game/item/IItem", "game/item/ItemDescriptions", "utilities/enum/Enums", "../../../core/objective/IObjective", "../../../core/ITars", "../../../core/ITars", "../../../core/objective/Objective", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemByGroup", "../../analyze/AnalyzeInventory"], function (require, exports, IItem_1, ItemDescriptions_1, Enums_1, IObjective_1, ITars_1, ITars_2, Objective_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemByGroup_1, AnalyzeInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireInventoryItem extends Objective_1.default {
        constructor(inventoryKey, options) {
            super();
            this.inventoryKey = inventoryKey;
            this.options = options;
        }
        getIdentifier() {
            return `AcquireInventoryItem:${this.inventoryKey}`;
        }
        getStatus() {
            return `Acquiring ${this.inventoryKey}`;
        }
        async execute(context) {
            let item = context.inventory[this.inventoryKey];
            if (Array.isArray(item)) {
                const items = this.options?.skipHardReservedItems ? item.filter(it => !context.isHardReservedItem(it)) : item;
                item = items.length >= (this.options?.desiredCount ?? 1) ? items[0] : undefined;
            }
            if (item !== undefined) {
                context.setData(this.contextDataKey, item);
                if (this.options?.reserveType !== undefined) {
                    switch (this.options.reserveType) {
                        case ITars_1.ReserveType.Soft:
                            context.addSoftReservedItems(item);
                            break;
                        case ITars_1.ReserveType.Hard:
                            context.addHardReservedItems(item);
                            break;
                    }
                }
                return IObjective_1.ObjectiveResult.Ignore;
            }
            context.log.info(`Acquiring ${this.inventoryKey}`);
            const objectivePipelines = [];
            const itemInfo = ITars_2.inventoryItemInfo[this.inventoryKey];
            const options = itemInfo?.requiredMinDur !== undefined ? { requiredMinDur: itemInfo.requiredMinDur } : undefined;
            if (itemInfo.itemTypes) {
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    if (context.island.items.isGroup(itemTypeOrGroup)) {
                        objectivePipelines.push([new AcquireItemByGroup_1.default(itemTypeOrGroup, options).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                    else {
                        objectivePipelines.push([new AcquireItem_1.default(itemTypeOrGroup, options).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            if (itemInfo.equipType) {
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = ItemDescriptions_1.itemDescriptions[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        objectivePipelines.push([new AcquireItem_1.default(itemType, options).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(context, actionType)) {
                        objectivePipelines.push([new AcquireItem_1.default(itemType, options).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = AcquireInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUludmVudG9yeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFlBQW1DLEVBQW1CLE9BQStDO1lBQ2pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUF3QztRQUVsSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWhELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDOUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7YUFDaEY7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