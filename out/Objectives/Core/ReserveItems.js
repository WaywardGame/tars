define(["require", "exports", "../../core/context/IContext", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IContext_1, ITars_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReserveItems extends Objective_1.default {
        constructor(...items) {
            super();
            this.items = items;
        }
        getIdentifier() {
            var _a;
            return `ReserveItem:${ITars_1.ReserveType[(_a = this.reserveType) !== null && _a !== void 0 ? _a : ITars_1.ReserveType.Hard]}:${this.shouldKeepInInventory() ? "KeepInInventory:" : ""}${this.items.join(",")}`;
        }
        getStatus() {
            return undefined;
        }
        async execute(context) {
            if (this.reserveType === ITars_1.ReserveType.Soft) {
                context.addSoftReservedItems(...this.items);
            }
            else {
                context.addHardReservedItems(...this.items);
            }
            if (this.shouldKeepInInventory()) {
                let keepInInventoryItems = context.getData(IContext_1.ContextDataType.KeepInInventoryItems);
                if (keepInInventoryItems) {
                    keepInInventoryItems.add(...this.items);
                }
                else {
                    keepInInventoryItems = new Set(this.items);
                }
                context.setData(IContext_1.ContextDataType.KeepInInventoryItems, keepInInventoryItems);
            }
            return IObjective_1.ObjectiveResult.Complete;
        }
    }
    exports.default = ReserveItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzZXJ2ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9SZXNlcnZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSWxELFlBQVksR0FBRyxLQUFhO1lBQzNCLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVNLGFBQWE7O1lBQ25CLE9BQU8sZUFBZSxtQkFBVyxDQUFDLE1BQUEsSUFBSSxDQUFDLFdBQVcsbUNBQUksbUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzVKLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO2dCQUMxQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFFNUM7aUJBQU07Z0JBQ04sT0FBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1lBRUQsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRTtnQkFDakMsSUFBSSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFZLDBCQUFlLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDNUYsSUFBSSxvQkFBb0IsRUFBRTtvQkFDekIsb0JBQW9CLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUV4QztxQkFBTTtvQkFDTixvQkFBb0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzNDO2dCQUVELE9BQU8sQ0FBQyxPQUFPLENBQUMsMEJBQWUsQ0FBQyxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO2FBQzVFO1lBRUQsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDO0tBRUQ7SUF6Q0QsK0JBeUNDIn0=