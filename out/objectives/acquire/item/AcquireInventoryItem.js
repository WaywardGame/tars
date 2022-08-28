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
                if (this.options?.skipHardReservedItems) {
                    item = item.find(it => !context.isHardReservedItem(it));
                }
                else {
                    item = item[0];
                }
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
            if (itemInfo.itemTypes) {
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    if (context.island.items.isGroup(itemTypeOrGroup)) {
                        objectivePipelines.push([new AcquireItemByGroup_1.default(itemTypeOrGroup).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                    else {
                        objectivePipelines.push([new AcquireItem_1.default(itemTypeOrGroup).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            if (itemInfo.equipType) {
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = ItemDescriptions_1.itemDescriptions[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        objectivePipelines.push([new AcquireItem_1.default(itemType).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(context, actionType)) {
                        objectivePipelines.push([new AcquireItem_1.default(itemType).passAcquireData(this), new AnalyzeInventory_1.default()]);
                    }
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = AcquireInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUludmVudG9yeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBeUJBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFlBQW1DLEVBQW1CLE9BQStDO1lBQ2pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUF3QztRQUVsSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRWhELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFO29CQUN4QyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBRXhEO3FCQUFNO29CQUNOLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2Y7YUFDRDtZQUVELElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDdkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUUzQyxJQUFJLElB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