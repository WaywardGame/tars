define(["require", "exports", "game/item/IItem", "language/Dictionaries", "language/Translation", "../../../Objective", "../../../utilities/Item", "../../other/IgniteItem", "./AcquireItem"], function (require, exports, IItem_1, Dictionaries_1, Translation_1, Objective_1, Item_1, IgniteItem_1, AcquireItem_1) {
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
            return `Acquiring ${Translation_1.default.nameOf(Dictionaries_1.Dictionary.Item, this.itemType).getString()} and igniting it`;
        }
        canIncludeContextHashCode() {
            return true;
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            const objectives = [];
            const itemToIgnite = Item_1.getItemInInventory(context, this.itemType);
            if (itemToIgnite === undefined) {
                objectives.push(new AcquireItem_1.default(this.itemType).setContextDataKey(this.getHashCode()));
            }
            objectives.push(new IgniteItem_1.default(itemToIgnite));
            return objectives;
        }
    }
    exports.default = AcquireItemAndIgnite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNxdWlyZUl0ZW1BbmRJZ25pdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy9hY3F1aXJlL2l0ZW0vQWNxdWlyZUl0ZW1BbmRJZ25pdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsTUFBcUIsb0JBQXFCLFNBQVEsbUJBQVM7UUFFdkQsWUFBNkIsUUFBa0I7WUFDM0MsS0FBSyxFQUFFLENBQUM7WUFEaUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUUvQyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLHdCQUF3QixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQzdELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxhQUFhLHFCQUFXLENBQUMsTUFBTSxDQUFDLHlCQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7UUFDekcsQ0FBQztRQUVNLHlCQUF5QjtZQUM1QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDaEQsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7WUFFcEMsTUFBTSxZQUFZLEdBQUcseUJBQWtCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoRSxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7Z0JBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3pGO1lBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUU5QyxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBRUo7SUFuQ0QsdUNBbUNDIn0=