define(["require", "exports", "game/item/IItem", "./AcquireBase", "./AcquireItem"], function (require, exports, IItem_1, AcquireBase_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemByTypes extends AcquireBase_1.default {
        constructor(itemTypes) {
            super();
            this.itemTypes = itemTypes;
        }
        getIdentifier() {
            return `AcquireItemByTypes:${this.itemTypes.map(itemType => IItem_1.ItemType[itemType]).join(",")}`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return this.itemTypes.some(itemType => context.isReservedItemType(itemType));
        }
        async execute() {
            return this.itemTypes
                .map(item => [new AcquireItem_1.default(item).passContextDataKey(this)]);
        }
    }
    exports.default = AcquireItemByTypes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeVR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL09iamVjdGl2ZXMvQWNxdWlyZS9JdGVtL0FjcXVpcmVJdGVtQnlUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxNQUFxQixrQkFBbUIsU0FBUSxxQkFBVztRQUUxRCxZQUE2QixTQUFxQjtZQUNqRCxLQUFLLEVBQUUsQ0FBQztZQURvQixjQUFTLEdBQVQsU0FBUyxDQUFZO1FBRWxELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdGLENBQUM7UUFFTSx5QkFBeUI7WUFDL0IsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDbkQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTztZQUNuQixPQUFPLElBQUksQ0FBQyxTQUFTO2lCQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsQ0FBQztLQUVEO0lBdkJELHFDQXVCQyJ9