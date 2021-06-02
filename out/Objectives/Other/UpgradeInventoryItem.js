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
                for (const itemType of Enums_1.default.values(IItem_1.ItemType)) {
                    const description = Items_1.default[itemType];
                    if (description && description.equip === itemInfo.equipType) {
                        this.addUpgradeObjectives(objectivePipelines, itemType, worth, description);
                    }
                }
            }
            if (itemInfo.actionTypes) {
                for (const actionType of itemInfo.actionTypes) {
                    for (const itemType of AcquireItemForAction_1.default.getItems(actionType)) {
                        const description = Items_1.default[itemType];
                        if (description) {
                            this.addUpgradeObjectives(objectivePipelines, itemType, worth, description);
                        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBncmFkZUludmVudG9yeUl0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9vdGhlci9VcGdyYWRlSW52ZW50b3J5SXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixvQkFBcUIsU0FBUSxtQkFBUztRQUUxRCxZQUE2QixPQUE4QjtZQUMxRCxLQUFLLEVBQUUsQ0FBQztZQURvQixZQUFPLEdBQVAsT0FBTyxDQUF1QjtRQUUzRCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHdCQUF3QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNqQixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUNoQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxRQUFRLEdBQUcseUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRWpELElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsS0FBSyxNQUFNLGVBQWUsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO29CQUNqRCxJQUFJLGVBQWUsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNsQyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7NEJBQ3pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7NEJBQzlELEtBQUssTUFBTSxhQUFhLElBQUksVUFBVSxFQUFFO2dDQUN2QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDOzZCQUNwRTt5QkFFRDs2QkFBTTs0QkFDTixJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO3lCQUN0RTtxQkFDRDtpQkFDRDthQUNEO1lBRUQsSUFBSSxRQUFRLENBQUMsU0FBUyxFQUFFO2dCQUN2QixLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQVEsQ0FBQyxFQUFFO29CQUM5QyxNQUFNLFdBQVcsR0FBRyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUMvQyxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxTQUFTLEVBQUU7d0JBQzVELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3FCQUM1RTtpQkFDRDthQUNEO1lBRUQsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFO2dCQUN6QixLQUFLLE1BQU0sVUFBVSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7b0JBQzlDLEtBQUssTUFBTSxRQUFRLElBQUksOEJBQW9CLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUNqRSxNQUFNLFdBQVcsR0FBRyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQyxJQUFJLFdBQVcsRUFBRTs0QkFDaEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7eUJBQzVFO3FCQUNEO2lCQUNEO2FBQ0Q7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7UUFFTyxvQkFBb0IsQ0FBQyxVQUEwQixFQUFFLFFBQWtCLEVBQUUsWUFBb0IsRUFBRSxXQUFXLEdBQUcsZUFBZ0IsQ0FBQyxRQUFRLENBQUM7WUFDMUksTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN4QyxJQUFJLGFBQWEsS0FBSyxTQUFTLElBQUksYUFBYSxHQUFHLFlBQVksRUFBRTtnQkFDaEUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0M7UUFDRixDQUFDO0tBQ0Q7SUEvRUQsdUNBK0VDIn0=