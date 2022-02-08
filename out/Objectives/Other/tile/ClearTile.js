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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJUaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9DbGVhclRpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBaUJBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUU1QyxZQUE2QixNQUFnQjtZQUN6QyxLQUFLLEVBQUUsQ0FBQztZQURpQixXQUFNLEdBQU4sTUFBTSxDQUFVO1FBRTdDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFFLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBaUI7Z0JBQzdCLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QyxDQUFDO1lBRUYsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUQsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlDLElBQUksa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pGLFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQzlHLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUNsQyxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO2FBQ3RCO1lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN0RCxVQUFVLENBQUMsSUFBSSxDQUNYLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLENBQUMsQ0FBQztvQkFDakgsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEVBQ2pDLElBQUksaUJBQU8sRUFBRSxDQUNoQixDQUFDO2FBQ0w7WUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekMsVUFBVSxDQUFDLElBQUksQ0FDWCxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ3RELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLG9CQUFVLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQztvQkFDekcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEVBQ2pDLElBQUksaUJBQU8sRUFBRSxDQUNoQixDQUFDO2FBQ0w7WUFFRCxPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDO0tBRUo7SUF2REQsNEJBdURDIn0=