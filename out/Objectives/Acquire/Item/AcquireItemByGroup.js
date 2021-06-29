define(["require", "exports", "game/item/IItem", "./AcquireBase", "./AcquireItem"], function (require, exports, IItem_1, AcquireBase_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemByGroup extends AcquireBase_1.default {
        constructor(itemTypeGroup, options = {}) {
            super();
            this.itemTypeGroup = itemTypeGroup;
            this.options = options;
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
            return this.getItemTypes().some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            let itemTypes = this.getItemTypes();
            if (this.options.excludeItemTypes) {
                itemTypes = itemTypes.filter(itemType => !this.options.excludeItemTypes.has(itemType));
            }
            return itemTypes.map(itemType => [new AcquireItem_1.default(itemType, this.options).passAcquireData(this)]);
        }
        getItemTypes() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeUdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtQnlHcm91cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUFxQixrQkFBbUIsU0FBUSxxQkFBVztRQUkxRCxZQUE2QixhQUE0QixFQUFtQixVQUF3QyxFQUFFO1lBQ3JILEtBQUssRUFBRSxDQUFDO1lBRG9CLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQW1DO1FBRXRILENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLHFCQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDbEUsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQzVFLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBQ25CLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ2xDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO1lBRUQsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFTyxZQUFZO1lBQ25CLElBQUksTUFBTSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzlELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDekIsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDbkUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2FBQ3pEO1lBRUQsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDOztJQXpDRixxQ0EwQ0M7SUF4Q3dCLHdCQUFLLEdBQW1DLElBQUksR0FBRyxFQUFFLENBQUMifQ==