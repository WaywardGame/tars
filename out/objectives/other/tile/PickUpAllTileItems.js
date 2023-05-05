define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../item/MoveItemIntoInventory"], function (require, exports, IObjective_1, Objective_1, MoveItemIntoInventory_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PickUpAllTileItems extends Objective_1.default {
        constructor(target) {
            super();
            this.target = target;
        }
        getIdentifier() {
            return `PickUpAllTileItems:${this.target.x},${this.target.y},${this.target.z}`;
        }
        getStatus() {
            return `Picking up all items on ${this.target.x},${this.target.y},${this.target.z}`;
        }
        async execute(context) {
            const targetTile = this.target;
            if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return targetTile.containedItems.map(item => new MoveItemIntoInventory_1.default(item));
        }
    }
    exports.default = PickUpAllTileItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlja1VwQWxsVGlsZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9QaWNrVXBBbGxUaWxlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFckQsWUFBNkIsTUFBWTtZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURpQixXQUFNLEdBQU4sTUFBTSxDQUFNO1FBRXpDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sc0JBQXNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbkYsQ0FBQztRQUVNLFNBQVM7WUFDWixPQUFPLDJCQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3hGLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDL0IsSUFBSSxVQUFVLENBQUMsY0FBYyxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ25GLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDbkM7WUFFRCxPQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSwrQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLENBQUM7S0FFSjtJQXZCRCxxQ0F1QkMifQ==