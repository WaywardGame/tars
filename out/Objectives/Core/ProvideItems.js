define(["require", "exports", "game/item/IItem", "../../IObjective", "../../Objective"], function (require, exports, IItem_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ProvideItems extends Objective_1.default {
        constructor(...itemTypes) {
            super();
            this.itemTypes = itemTypes;
        }
        getIdentifier() {
            return `ProvideItems:${this.itemTypes.map(itemType => IItem_1.ItemType[itemType]).join(",")}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            context.addProvidedItems(this.itemTypes);
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = ProvideItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvdmlkZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9Qcm92aWRlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSS9DLFlBQVksR0FBRyxTQUFxQjtZQUNoQyxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQy9CLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sZ0JBQWdCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzFGLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxTQUFTLENBQUM7UUFDckIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1FBQ3BDLENBQUM7S0FFSjtJQXZCRCwrQkF1QkMifQ==