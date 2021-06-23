define(["require", "exports", "../../../IObjective", "../../../Objective", "../item/MoveItem"], function (require, exports, IObjective_1, Objective_1, MoveItem_1) {
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
            const targetTile = game.getTileFromPoint(this.target);
            if (targetTile.containedItems === undefined || targetTile.containedItems.length === 0) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            return targetTile.containedItems.map(item => new MoveItem_1.default(item, context.player.inventory));
        }
    }
    exports.default = PickUpAllTileItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlja1VwQWxsVGlsZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9QaWNrVXBBbGxUaWxlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUEsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFckQsWUFBNkIsTUFBZ0I7WUFDekMsS0FBSyxFQUFFLENBQUM7WUFEaUIsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUU3QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLHNCQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25GLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTywyQkFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN4RixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUksVUFBVSxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuRixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsT0FBTyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksa0JBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQy9GLENBQUM7S0FFSjtJQXZCRCxxQ0F1QkMifQ==