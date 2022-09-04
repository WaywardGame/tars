define(["require", "exports", "game/item/IItem", "language/Dictionary", "language/Translation", "../../core/objective/IObjective", "../../core/objective/Objective", "../../utilities/Item"], function (require, exports, IItem_1, Dictionary_1, Translation_1, IObjective_1, Objective_1, Item_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseProvidedItem extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
            this.includePositionInHashCode = false;
        }
        getIdentifier() {
            return `UseProvidedItem:${IItem_1.ItemType[this.itemType]}`;
        }
        getStatus() {
            return `Using ${Translation_1.default.nameOf(Dictionary_1.default.Item, this.itemType).getString()}`;
        }
        canIncludeContextHashCode() {
            return Item_1.ItemUtilities.getRelatedItemTypes(this.itemType, Item_1.RelatedItemType.All);
        }
        shouldIncludeContextHashCode(context) {
            return context.isReservedItemType(this.itemType);
        }
        async execute(context) {
            return context.tryUseProvidedItems(this.itemType) ? IObjective_1.ObjectiveResult.Complete : IObjective_1.ObjectiveResult.Impossible;
        }
    }
    exports.default = UseProvidedItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlUHJvdmlkZWRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Vc2VQcm92aWRlZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUlsRCxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBRnRCLDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUlwRSxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLG1CQUFtQixnQkFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1FBQ3hELENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxTQUFTLHFCQUFXLENBQUMsTUFBTSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ3JGLENBQUM7UUFFZSx5QkFBeUI7WUFDckMsT0FBTyxvQkFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsc0JBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqRixDQUFDO1FBRWUsNEJBQTRCLENBQUMsT0FBZ0I7WUFDekQsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsVUFBVSxDQUFDO1FBQzlHLENBQUM7S0FFSjtJQTVCRCxrQ0E0QkMifQ==