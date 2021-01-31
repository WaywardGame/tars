define(["require", "exports", "item/IItem", "./AcquireBase", "./AcquireItem"], function (require, exports, IItem_1, AcquireBase_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemByGroup extends AcquireBase_1.default {
        constructor(itemTypeGroup) {
            super();
            this.itemTypeGroup = itemTypeGroup;
        }
        getIdentifier() {
            return `AcquireItemByGroup:${IItem_1.ItemTypeGroup[this.itemTypeGroup]}`;
        }
        getStatus() {
            return `Acquiring ${itemManager.getItemTypeGroupName(this.itemTypeGroup)}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.getItems().some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return this.getItems()
                .map(item => [new AcquireItem_1.default(item).passContextDataKey(this)]);
        }
        getItems() {
            let result = AcquireItemByGroup.cache.get(this.itemTypeGroup);
            if (result === undefined) {
                result = Array.from(itemManager.getGroupItems(this.itemTypeGroup));
                AcquireItemByGroup.cache.set(this.itemTypeGroup, result);
            }
            return result;
        }
    }
    exports.default = AcquireItemByGroup;
    AcquireItemByGroup.cache = new Map();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeUdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZS9JdGVtL0FjcXVpcmVJdGVtQnlHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUFxQixrQkFBbUIsU0FBUSxxQkFBVztRQUkxRCxZQUE2QixhQUE0QjtZQUN4RCxLQUFLLEVBQUUsQ0FBQztZQURvQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUV6RCxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLHNCQUFzQixxQkFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ2xFLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDO1FBRU0seUJBQXlCO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLDRCQUE0QixDQUFDLE9BQWdCO1lBQ25ELE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTztZQUNuQixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUU7aUJBQ3BCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRU8sUUFBUTtZQUNmLElBQUksTUFBTSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzlELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDbkUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQXJDRixxQ0FzQ0M7SUFwQ3dCLHdCQUFLLEdBQW1DLElBQUksR0FBRyxFQUFFLENBQUMifQ==