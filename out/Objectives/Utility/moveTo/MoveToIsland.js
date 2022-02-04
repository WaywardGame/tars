define(["require", "exports", "game/entity/action/IAction", "game/island/IIsland", "game/item/IItem", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../acquire/item/AcquireItem", "../../analyze/AnalyzeInventory", "../../core/ExecuteAction", "../../other/item/MoveItemIntoInventory", "./MoveToWater"], function (require, exports, IAction_1, IIsland_1, IItem_1, IObjective_1, Objective_1, AcquireItem_1, AnalyzeInventory_1, ExecuteAction_1, MoveItemIntoInventory_1, MoveToWater_1) {
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
            if (context.human.islandId === this.islandId) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const player = context.human.asPlayer;
            if (!player) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const islandPosition = IIsland_1.IslandPosition.fromId(this.islandId);
            if (islandPosition === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return [
                ...(context.inventory.sailBoat ? [new MoveItemIntoInventory_1.default(context.inventory.sailBoat)] : [new AcquireItem_1.default(IItem_1.ItemType.Sailboat), new AnalyzeInventory_1.default()]),
                new MoveToWater_1.default(true),
                new ExecuteAction_1.default(IAction_1.ActionType.SailToIsland, (context, action) => {
                    action.execute(player, islandPosition.x, islandPosition.y);
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus(this),
            ];
        }
    }
    exports.default = MoveToIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvSXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvSXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE1BQU0sY0FBYyxHQUFHLHdCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxPQUFPO2dCQUNILEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLCtCQUFxQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLHFCQUFXLENBQUMsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLDBCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDeEosSUFBSSxxQkFBVyxDQUFDLElBQUksQ0FBQztnQkFFckIsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUMzRCxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0QsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzthQVVyQixDQUFDO1FBQ04sQ0FBQztLQUVKO0lBakRELCtCQWlEQyJ9