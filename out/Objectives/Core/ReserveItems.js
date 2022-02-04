define(["require", "exports", "../../core/context/IContext", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IContext_1, ITars_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReserveItems extends Objective_1.default {
        constructor(...items) {
            super();
            this.items = items;
        }
        getIdentifier() {
            return `ReserveItem:${ITars_1.ReserveType[this.reserveType ?? ITars_1.ReserveType.Hard]}:${this.shouldKeepInInventory() ? "KeepInInventory:" : ""}${this.items.join(",")}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzZXJ2ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9SZXNlcnZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBSWxELFlBQVksR0FBRyxLQUFhO1lBQzNCLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLG1CQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxtQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDNUosQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUU7Z0JBQzFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUU1QztpQkFBTTtnQkFDTixPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQVksMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLG9CQUFvQixFQUFFO29CQUN6QixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXhDO3FCQUFNO29CQUNOLG9CQUFvQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDM0M7Z0JBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7YUFDNUU7WUFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1FBQ2pDLENBQUM7S0FFRDtJQXpDRCwrQkF5Q0MifQ==