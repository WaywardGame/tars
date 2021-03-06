define(["require", "exports", "game/item/IItem", "language/Translation", "language/Dictionaries", "./AcquireBase", "./AcquireItem"], function (require, exports, IItem_1, Translation_1, Dictionaries_1, AcquireBase_1, AcquireItem_1) {
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
        getStatus() {
            const itemTypesString = this.itemTypes
                .map(itemType => Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, itemType))
                .collect(Translation_1.default.formatList, Translation_1.ListEnder.Or);
            return `Acquiring ${itemTypesString}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1CeVR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvYWNxdWlyZS9pdGVtL0FjcXVpcmVJdGVtQnlUeXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixrQkFBbUIsU0FBUSxxQkFBVztRQUUxRCxZQUE2QixTQUFxQjtZQUNqRCxLQUFLLEVBQUUsQ0FBQztZQURvQixjQUFTLEdBQVQsU0FBUyxDQUFZO1FBRWxELENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdGLENBQUM7UUFFTSxTQUFTO1lBQ2YsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVM7aUJBQ3BDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2lCQUM5RCxPQUFPLENBQUMscUJBQVcsQ0FBQyxVQUFVLEVBQUUsdUJBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVoRCxPQUFPLGFBQWEsZUFBZSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUVNLHlCQUF5QjtZQUMvQixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUNuRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVM7aUJBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxDQUFDO0tBRUQ7SUEvQkQscUNBK0JDIn0=