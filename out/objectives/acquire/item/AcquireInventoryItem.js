/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/utilities/enum/Enums", "../../../core/objective/IObjective", "../../../core/ITars", "../../../core/ITars", "../../../core/objective/Objective", "./AcquireItem", "./AcquireItemForAction", "./AcquireItemByGroup", "../../analyze/AnalyzeInventory"], function (require, exports, IItem_1, ItemDescriptions_1, Enums_1, IObjective_1, ITars_1, ITars_2, Objective_1, AcquireItem_1, AcquireItemForAction_1, AcquireItemByGroup_1, AnalyzeInventory_1) {
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
                item = numberOfMissingItems <= 0 ? items[0] : undefined;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUludmVudG9yeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNEJILE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFlBQW1DLEVBQW1CLE9BQStDO1lBQ2pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUF3QztRQUVsSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksb0JBQTRCLENBQUM7WUFFakMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQzlHLG9CQUFvQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDeEUsSUFBSSxH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