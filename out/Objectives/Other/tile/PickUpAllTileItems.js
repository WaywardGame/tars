define(["require", "exports", "game/entity/action/IAction", "../../../IObjective", "../../../Objective", "../../core/ExecuteAction"], function (require, exports, IAction_1, IObjective_1, Objective_1, ExecuteAction_1) {
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
            const objectives = [];
            for (const item of targetTile.containedItems) {
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                    action.execute(context.player, item, context.player.inventory);
                }));
            }
            return objectives;
        }
    }
    exports.default = PickUpAllTileItems;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGlja1VwQWxsVGlsZUl0ZW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9QaWNrVXBBbGxUaWxlSXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsa0JBQW1CLFNBQVEsbUJBQVM7UUFFckQsWUFBNkIsTUFBZ0I7WUFDekMsS0FBSyxFQUFFLENBQUM7WUFEaUIsV0FBTSxHQUFOLE1BQU0sQ0FBVTtRQUU3QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLHNCQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25GLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTywyQkFBMkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN4RixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUksVUFBVSxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuRixPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ25DO1lBRUQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztZQUVwQyxLQUFLLE1BQU0sSUFBSSxJQUFJLFVBQVUsQ0FBQyxjQUFjLEVBQUU7Z0JBQzFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN2RSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25FLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDUDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FFSjtJQS9CRCxxQ0ErQkMifQ==