define(["require", "exports", "game/entity/action/IAction", "game/tile/Terrains", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Restart", "./PickUpAllTileItems"], function (require, exports, IAction_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, ExecuteAction_1, Restart_1, PickUpAllTileItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ClearTile extends Objective_1.default {
        constructor(target) {
            super();
            this.target = target;
        }
        getIdentifier() {
            return `ClearTile:${this.target.x},${this.target.y},${this.target.z}`;
        }
        getStatus() {
            return `Clearing tile ${this.target.x},${this.target.y},${this.target.z}`;
        }
        async execute(context) {
            const objectives = [
                new PickUpAllTileItems_1.default(this.target),
            ];
            const tile = context.island.getTileFromPoint(this.target);
            if (tile.npc || tile.creature || context.human.island.isPlayerAtTile(tile, false, true)) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const tileType = TileHelpers_1.default.getType(tile);
            const terrainDescription = Terrains_1.default[tileType];
            if (terrainDescription && !terrainDescription.passable && !terrainDescription.water) {
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Mine, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForTerrainGather(context, tileType));
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus("Destroying terrain"), new Restart_1.default());
            }
            if (tile.doodad && !tile.doodad.canPickup(context.human)) {
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Chop, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestToolForDoodadGather(context, tile.doodad));
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus("Destroying doodad"), new Restart_1.default());
            }
            if (context.utilities.tile.hasCorpses(tile)) {
                objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.Butcher, (context, action) => {
                    action.execute(context.actionExecutor, context.utilities.item.getBestTool(context, IAction_1.ActionType.Butcher));
                    return IObjective_1.ObjectiveResult.Complete;
                }).setStatus("Butchering corpse"), new Restart_1.default());
            }
            return objectives;
        }
    }
    exports.default = ClearTile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJUaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9DbGVhclRpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUU1QyxZQUE2QixNQUFnQjtZQUN6QyxLQUFLLEVBQUUsQ0FBQztZQURpQixXQUFNLEdBQU4sTUFBTSxDQUFVO1FBRTdDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFFLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBaUI7Z0JBQzdCLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QyxDQUFDO1lBRUYsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUQsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JGLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQkFDakYsVUFBVSxDQUFDLElBQUksQ0FDWCxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDOUcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEVBQ2xDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7YUFDdEI7WUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3RELFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUFDO29CQUNqSCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFDakMsSUFBSSxpQkFBTyxFQUFFLENBQ2hCLENBQUM7YUFDTDtZQUVELElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN6QyxVQUFVLENBQUMsSUFBSSxDQUNYLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDdEQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsb0JBQVUsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDO29CQUN6RyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsRUFDakMsSUFBSSxpQkFBTyxFQUFFLENBQ2hCLENBQUM7YUFDTDtZQUVELE9BQU8sVUFBVSxDQUFDO1FBQ3RCLENBQUM7S0FFSjtJQTNERCw0QkEyREMifQ==