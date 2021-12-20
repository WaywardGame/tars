define(["require", "exports", "game/entity/action/IAction", "game/island/IIsland", "game/item/IItem", "../../../IObjective", "../../../Objective", "../../acquire/item/AcquireItem", "../../analyze/AnalyzeInventory", "../../core/ExecuteAction", "../../other/item/MoveItemIntoInventory", "./MoveToWater"], function (require, exports, IAction_1, IIsland_1, IItem_1, IObjective_1, Objective_1, AcquireItem_1, AnalyzeInventory_1, ExecuteAction_1, MoveItemIntoInventory_1, MoveToWater_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToIsland extends Objective_1.default {
        constructor(islandId) {
            super();
            this.islandId = islandId;
        }
        getIdentifier() {
            return "MoveToIsland";
        }
        getStatus() {
            return `Moving to a island ${this.islandId}`;
        }
        async execute(context) {
            if (context.player.islandId === this.islandId) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const islandPosition = IIsland_1.IslandPosition.fromId(this.islandId);
            if (islandPosition === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                ...(context.inventory.sailBoat ? [new MoveItemIntoInventory_1.default(context.inventory.sailBoat)] : [new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default()]),
                new MoveToWater_1.default(true),
                new ExecuteAction_1.default(IAction_1.ActionType.SailToIsland, (context, action) => {
                    action.execute(context.player, islandPosition.x, islandPosition.y);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this),
            ];
        }
    }
    exports.default = MoveToIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvSXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvSXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWFBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDM0MsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sY0FBYyxHQUFHLHdCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUF5QkQsT0FBTztnQkFDSCxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSwrQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxxQkFBVyxDQUFDLGdCQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3hKLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBRXJCLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDM0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNuRSxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2FBVXJCLENBQUM7UUFDTixDQUFDO0tBRUo7SUFuRUQsK0JBbUVDIn0=