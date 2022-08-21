define(["require", "exports", "../../core/context/IContext", "../../core/ITars", "../../core/objective/IObjective", "../../core/objective/Objective"], function (require, exports, IContext_1, ITars_1, IObjective_1, Objective_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ReserveItems extends Objective_1.default {
        constructor(...items) {
            super();
            this.items = items;
        }
        getIdentifier() {
            return `ReserveItem:${ITars_1.ReserveType[this.reserveType ?? ITars_1.ReserveType.Hard]}:${this.shouldKeepInInventory() ? "KeepInInventory:" : ""}${this.objectiveHashCode ? this.objectiveHashCode : ""}${this.items.join(",")}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzZXJ2ZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvY29yZS9SZXNlcnZlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsTUFBcUIsWUFBYSxTQUFRLG1CQUFTO1FBS2xELFlBQVksR0FBRyxLQUFhO1lBQzNCLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLG1CQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxtQkFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNuTixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFTSxxQkFBcUIsQ0FBQyxpQkFBeUI7WUFDckQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO1lBQzNDLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssU0FBUyxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssbUJBQVcsQ0FBQyxJQUFJLEVBQUU7b0JBQzFDLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRXhGO3FCQUFNO29CQUNOLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hGO2FBRUQ7aUJBQU07Z0JBQ04sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLG1CQUFXLENBQUMsSUFBSSxFQUFFO29CQUMxQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBRTVDO3FCQUFNO29CQUNOLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDNUM7YUFDRDtZQUVELElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7Z0JBQ2pDLElBQUksb0JBQW9CLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBWSwwQkFBZSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQzVGLElBQUksb0JBQW9CLEVBQUU7b0JBQ3pCLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFFeEM7cUJBQU07b0JBQ04sb0JBQW9CLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMzQztnQkFFRCxPQUFPLENBQUMsT0FBTyxDQUFDLDBCQUFlLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzthQUM1RTtZQUVELE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQztLQUVEO0lBekRELCtCQXlEQyJ9