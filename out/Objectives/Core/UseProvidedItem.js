define(["require", "exports", "game/item/IItem", "../../IObjective", "../../Objective"], function (require, exports, IItem_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UseProvidedItem extends Objective_1.default {
        constructor(itemType) {
            super();
            this.itemType = itemType;
        }
        getIdentifier() {
            return `UseProvidedItem:${IItem_1.ItemType[this.itemType]}`;
        }
        canIncludeContextHashCode() {
            return true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlUHJvdmlkZWRJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Vc2VQcm92aWRlZEl0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsZUFBZ0IsU0FBUSxtQkFBUztRQUVsRCxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sbUJBQW1CLGdCQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDeEQsQ0FBQztRQUVNLHlCQUF5QjtZQUM1QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU0sNEJBQTRCLENBQUMsT0FBZ0I7WUFDaEQsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE9BQU8sT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDRCQUFlLENBQUMsVUFBVSxDQUFDO1FBQzlHLENBQUM7S0FFSjtJQXRCRCxrQ0FzQkMifQ==