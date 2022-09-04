define(["require", "exports", "../../core/context/IContext", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IContext_1, ITars_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReserveItems extends Objective_1.default {
        constructor(...items) {
            super();
            this.includePositionInHashCode = false;
            this.items = items;
        }
        getIdentifier() {
            return `ReserveItems:${ITars_1.ReserveType[this.reserveType ?? ITars_1.ReserveType.Hard]}:${this.shouldKeepInInventory() ? "KeepInInventory:" : ""}${this.objectiveHashCode ? this.objectiveHashCode : ""}${this.items.join(",")}`;
        }
        getStatus() {
            return undefined;
        }
        passObjectiveHashCode(objectiveHashCode) {
            this.objectiveHashCode = objectiveHashCode;
            return this;
        }
        async execute(context) {
            if (this.objectiveHashCode !== undefined) {
                if (this.reserveType === ITars_1.ReserveType.Soft) {
                    context.addSoftReservedItemsForObjectiveHashCode(this.objectiveHashCode, ...this.items);
                }
                else {
                    context.addHardReservedItemsForObjectiveHashCode(this.objectiveHashCode, ...this.items);
                }
            }
            else {
                if (this.reserveType === ITars_1.ReserveType.Soft) {
                    context.addSoftReservedItems(...this.items);
                }
                else {
                    context.addHardReservedItems(...this.items);
                }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzZXJ2ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9SZXNlcnZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBT2xELFlBQVksR0FBRyxLQUFhO1lBQzNCLEtBQUssRUFBRSxDQUFDO1lBTmdCLDhCQUF5QixHQUFZLEtBQUssQ0FBQztZQVFuRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNwQixDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGdCQUFnQixtQkFBVyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksbUJBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcE4sQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU0scUJBQXFCLENBQUMsaUJBQXlCO1lBQ3JELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksSUFBSSxDQUFDLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDekMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO29CQUMxQyxPQUFPLENBQUMsd0NBQXdDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUV4RjtxQkFBTTtvQkFDTixPQUFPLENBQUMsd0NBQXdDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4RjthQUVEO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxtQkFBVyxDQUFDLElBQUksRUFBRTtvQkFDMUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUU1QztxQkFBTTtvQkFDTixPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzVDO2FBQ0Q7WUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQVksMEJBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2dCQUM1RixJQUFJLG9CQUFvQixFQUFFO29CQUN6QixvQkFBb0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXhDO3FCQUFNO29CQUNOLG9CQUFvQixHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDM0M7Z0JBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQywwQkFBZSxDQUFDLG9CQUFvQixFQUFFLG9CQUFvQixDQUFDLENBQUM7YUFDNUU7WUFFRCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO1FBQ2pDLENBQUM7S0FFRDtJQTNERCwrQkEyREMifQ==