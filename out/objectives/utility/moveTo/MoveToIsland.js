define(["require", "exports", "game/doodad/IDoodad", "game/island/IIsland", "game/entity/action/actions/SailToIsland", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/MoveToTarget", "../../other/item/MoveItemIntoInventory", "./MoveToWater", "../../acquire/item/AcquireInventoryItem"], function (require, exports, IDoodad_1, IIsland_1, SailToIsland_1, IObjective_1, Objective_1, ExecuteAction_1, MoveToTarget_1, MoveItemIntoInventory_1, MoveToWater_1, AcquireInventoryItem_1) {
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
            const islandPosition = IIsland_1.IslandPosition.fromId(this.islandId);
            if (islandPosition === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const objectivePipelines = [];
            if (context.inventory.sailBoat) {
                objectivePipelines.push([
                    new MoveItemIntoInventory_1.default(context.inventory.sailBoat),
                    new MoveToWater_1.default(true),
                    new ExecuteAction_1.default(SailToIsland_1.default, [islandPosition.x, islandPosition.y]).setStatus(this),
                ]);
            }
            else {
                const sailBoats = context.utilities.object.findDoodads(context, "SailBoat", (doodad) => doodad.type === IDoodad_1.DoodadType.Sailboat);
                for (const sailBoat of sailBoats) {
                    const result = context.human.canSailAwayFromPosition(context.human.island, sailBoat);
                    if (result.canSailAway) {
                        objectivePipelines.push([
                            new MoveToTarget_1.default(sailBoat, false),
                            new ExecuteAction_1.default(SailToIsland_1.default, [islandPosition.x, islandPosition.y]).setStatus(this),
                        ]);
                    }
                }
                if (objectivePipelines.length === 0) {
                    objectivePipelines.push([
                        new AcquireInventoryItem_1.default("sailBoat"),
                        new MoveToWater_1.default(true),
                        new ExecuteAction_1.default(SailToIsland_1.default, [islandPosition.x, islandPosition.y]).setStatus(this),
                    ]);
                }
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToIsland;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvSXNsYW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvdXRpbGl0eS9tb3ZlVG8vTW92ZVRvSXNsYW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLE1BQXFCLFlBQWEsU0FBUSxtQkFBUztRQUUvQyxZQUE2QixRQUFrQjtZQUMzQyxLQUFLLEVBQUUsQ0FBQztZQURpQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBRS9DLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sY0FBYyxDQUFDO1FBQzFCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxzQkFBc0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDMUMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNuQztZQUVELE1BQU0sY0FBYyxHQUFHLHdCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1RCxJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQzlCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDNUIsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUNwQixJQUFJLCtCQUFxQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO29CQUNyRCxJQUFJLHFCQUFXLENBQUMsSUFBSSxDQUFDO29CQUNyQixJQUFJLHVCQUFhLENBQUMsc0JBQVksRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztpQkFDeEYsQ0FBQyxDQUFDO2FBRU47aUJBQU07Z0JBQ0gsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssb0JBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDN0gsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7b0JBQzlCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3JGLElBQUksTUFBTSxDQUFDLFdBQVcsRUFBRTt3QkFDcEIsa0JBQWtCLENBQUMsSUFBSSxDQUFDOzRCQUNwQixJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQzs0QkFDakMsSUFBSSx1QkFBYSxDQUFDLHNCQUFZLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7eUJBQ3hGLENBQUMsQ0FBQztxQkFDTjtpQkFDSjtnQkFFRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBRWpDLGtCQUFrQixDQUFDLElBQUksQ0FBQzt3QkFDcEIsSUFBSSw4QkFBb0IsQ0FBQyxVQUFVLENBQUM7d0JBQ3BDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUM7d0JBQ3JCLElBQUksdUJBQWEsQ0FBQyxzQkFBWSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO3FCQUN4RixDQUFDLENBQUM7aUJBQ047YUFDSjtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDOUIsQ0FBQztLQUVKO0lBMURELCtCQTBEQyJ9