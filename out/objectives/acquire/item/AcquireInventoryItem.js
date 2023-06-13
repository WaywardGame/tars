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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUludmVudG9yeUl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBNEJILE1BQXFCLG9CQUFxQixTQUFRLG1CQUFTO1FBRTFELFlBQTZCLFlBQW1DLEVBQW1CLE9BQStDO1lBQ2pJLEtBQUssRUFBRSxDQUFDO1lBRG9CLGlCQUFZLEdBQVosWUFBWSxDQUF1QjtZQUFtQixZQUFPLEdBQVAsT0FBTyxDQUF3QztRQUVsSSxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEQsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksb0JBQTRCLENBQUM7WUFFakMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUM5RyxvQkFBb0IsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3hFLElBQUksR0FBRyxvQkFBb0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO2FBRXhEO2lCQUFNLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLG9CQUFvQixHQUFHLENBQUMsQ0FBQzthQUV6QjtpQkFBTTtnQkFDTixvQkFBb0IsR0FBRyxDQUFDLENBQUM7YUFDekI7WUFFRCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFFM0MsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsS0FBSyxTQUFTLEVBQUU7b0JBQzVDLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUU7d0JBQ2pDLEtBQUssbUJBQVcsQ0FBQyxJQUFJOzRCQUNwQixPQUFPLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ25DLE1BQU07d0JBRVAsS0FBSyxtQkFBVyxDQUFDLElBQUk7NEJBQ3BCLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDbkMsTUFBTTtxQkFDUDtpQkFDRDtnQkFFRCxPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO2FBQzlCO1lBRUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsWUFBWSx3QkFBd0Isb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1lBRS9GLE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLFFBQVEsR0FBRyx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDdEQsTUFBTSxPQUFPLEdBQTZDLFFBQVEsRUFBRSxjQUFjLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUUzSixJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO2dCQUNoSCxLQUFLLE1BQU0sZUFBZSxJQUFJLFNBQVMsRUFBRTtvQkFDeEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQzVHO2FBQ0Q7WUFFRCxJQUFJLFFBQVEsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZCLEtBQUssTUFBTSxRQUFRLElBQUksZUFBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBUSxDQUFDLEVBQUU7b0JBQzlDLE1BQU0sV0FBVyxHQUFHLG1DQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7d0JBQzVELGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUNyRztpQkFDRDthQUNEO1lBRUQsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUN6QixLQUFLLE1BQU0sVUFBVSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7b0JBQzlDLEtBQUssTUFBTSxRQUFRLElBQUksOEJBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDMUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7cUJBQ3JHO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxPQUFnQixFQUFFLGVBQXlDLEVBQUUsYUFBcUIsRUFBRSxPQUFpRDtZQUNqSyxNQUFNLGlCQUFpQixHQUFpQixFQUFFLENBQUM7WUFFM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7b0JBQ2xELGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFFL0Y7cUJBQU07b0JBQ04saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUkscUJBQVcsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQ3hGO2FBQ0Q7WUFFRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFFL0MsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO0tBRUQ7SUFuR0QsdUNBbUdDIn0=