define(["require", "exports", "game/item/IItem", "game/item/Items", "utilities/enum/Enums", "../../IObjective", "../../ITars", "../../Objective", "../acquire/item/AcquireItem"], function (require, exports, IItem_1, Items_1, Enums_1, IObjective_1, ITars_1, Objective_1, AcquireItem_1) {
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
            const item = context.inventory[this.upgrade];
            if (!item || Array.isArray(item)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const description = item.description();
            if (!description) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const worth = description.worth;
            if (worth === undefined) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const itemInfo = ITars_1.inventoryItemInfo[this.upgrade];
            if (itemInfo.itemTypes) {
                for (const itemTypeOrGroup of itemInfo.itemTypes) {
                    if (itemTypeOrGroup !== item.type) {
                        if (itemManager.isGroup(itemTypeOrGroup)) {
                            const groupItems = itemManager.getGroupItems(itemTypeOrGroup);
                            for (const groupItemType of groupItems) {
                                this.addUpgradeObjectives(objectivePipelines, groupItemType, worth);
                            }
                        }
                        else {
                            this.addUpgradeObjectives(objectivePipelines, itemTypeOrGroup, worth);
                        }
                    }
                }
            }
            if (itemInfo.equipType) {
                for (const it of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = Items_1.default[it];
                    if (description && description.equip === itemInfo.equipType) {
                        this.addUpgradeObjectives(objectivePipelines, it, worth, description);
                    }
                }
            }
            return objectivePipelines;
        }
        addUpgradeObjectives(objectives, itemType, currentWorth, description = Items_1.default[itemType]) {
            const itemTypeWorth = description.worth;
            if (itemTypeWorth !== undefined && itemTypeWorth > currentWorth) {
                objectives.push([new AcquireItem_1.default(itemType)]);
            }
        }
    }
    exports.default = UpgradeInventoryItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUUzRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUNoQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxRQUFRLEdBQUcseUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWpELElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsS0FBSyxNQUFNLGVBQWUsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO29CQUNqRCxJQUFJLGVBQWUsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNsQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ3pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQzlELEtBQUssTUFBTSxhQUFhLElBQUksVUFBVSxFQUFFO2dDQUN2QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDOzZCQUNwRTt5QkFFRDs2QkFBTTs0QkFDTixJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUN0RTtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO2dCQUN2QixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLFdBQVcsR0FBRyxlQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7d0JBQzVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUN0RTtpQkFDRDthQUNEO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO1FBRU8sb0JBQW9CLENBQUMsVUFBMEIsRUFBRSxRQUFrQixFQUFFLFlBQW9CLEVBQUUsV0FBVyxHQUFHLGVBQWdCLENBQUMsUUFBUSxDQUFDO1lBQzFJLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDeEMsSUFBSSxhQUFhLEtBQUssU0FBUyxJQUFJLGFBQWEsR0FBRyxZQUFZLEVBQUU7Z0JBQ2hFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdDO1FBQ0YsQ0FBQztLQUNEO0lBcEVELHVDQW9FQyJ9