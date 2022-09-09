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
            let numberOfMissingItems;
            let item = context.inventory[this.inventoryKey];
            if (Array.isArray(item)) {
                const items = this.options?.skipHardReservedItems ? item.filter(it => !context.isHardReservedItem(it)) : item;
                numberOfMissingItems = (this.options?.desiredCount ?? 1) - items.length;
                item = items[0];
            }
            else if (!item) {
                numberOfMissingItems = 1;
            }
            else {
                numberOfMissingItems = 0;
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
            context.log.info(`Acquiring ${this.inventoryKey}. Number of missing: ${numberOfMissingItems}`);
            const objectivePipelines = [];
            const itemInfo = ITars_2.inventoryItemInfo[this.inventoryKey];
            const options = itemInfo?.requiredMinDur !== undefined ? { requiredMinDur: itemInfo.requiredMinDur } : undefined;
            if (itemInfo.itemTypes) {
                const itemTypes = typeof (itemInfo.itemTypes) === "function" ? itemInfo.itemTypes(context) : itemInfo.itemTypes;
                for (const itemTypeOrGroup of itemTypes) {
                    objectivePipelines.push(this.getObjectivePipeline(context, itemTypeOrGroup, numberOfMissingItems, options));
                }
            }
            if (itemInfo.equipType) {
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = ItemDescriptions_1.itemDescriptions[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        objectivePipelines.push(this.getObjectivePipeline(context, itemType, numberOfMissingItems, options));
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(context, actionType)) {
                        objectivePipelines.push(this.getObjectivePipeline(context, itemType, numberOfMissingItems, options));
                    }
                }
            }
            return objectivePipelines;
        }
        getObjectivePipeline(context, itemTypeOrGroup, numberOfItems, options) {
            const objectivePipeline = [];
            for (let i = 0; i < numberOfItems; i++) {
                if (context.island.items.isGroup(itemTypeOrGroup)) {
                    objectivePipeline.push(new AcquireItemByGroup_1.default(itemTypeOrGroup, options).passAcquireData(this));
                }
                else {
                    objectivePipeline.push(new AcquireItem_1.default(itemTypeOrGroup, options).passAcquireData(this));
                }
            }
            objectivePipeline.push(new AnalyzeInventory_1.default());
            return objectivePipeline;
        }
    }
    exports.default = AcquireInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUludmVudG9yeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBMkJBLE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFlBQW1DLEVBQW1CLE9BQStDO1lBQ2pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUF3QztRQUVsSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksb0JBQTRCLENBQUM7WUFFakMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUM5RyxvQkFBb0IsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3hFLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFD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