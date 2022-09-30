define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../../core/objective/Objective", "../../../utilities/Item", "../../other/item/IgniteItem", "./AcquireItem"], function (require, exports, IItem_1, Dictionary_1, Translation_1, Objective_1, Item_1, IgniteItem_1, AcquireItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AcquireItemAndIgnite extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getIdentifier() {
            return `AcquireItemAndIgnite:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Acquiring ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()} and igniting it`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType, Item_1.RelatedItemType.All);
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            const objectives = [];
            const itemToIgnite = context.utilities.item.getItemInInventory(context, this.itemType);
            if (itemToIgnite === undefined) {
                objectives.push(new AcquireItem_1.default(this.itemType).passAcquireData(this));
            }
            objectives.push(new IgniteItem_1.default(itemToIgnite));
            return objectives;
        }
    }
    exports.default = AcquireItemAndIgnite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1BbmRJZ25pdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1BbmRJZ25pdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBYUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsUUFBa0I7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEaUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLHdCQUF3QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7UUFDekcsQ0FBQztRQUVlLHlCQUF5QjtZQUNyQyxPQUFPLG9CQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxzQkFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7UUFFZSw0QkFBNEIsQ0FBQyxPQUFnQjtZQUN6RCxPQUFPLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckQsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZGLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHFCQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3pFO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUU5QyxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBRUo7SUFuQ0QsdUNBbUNDIn0=