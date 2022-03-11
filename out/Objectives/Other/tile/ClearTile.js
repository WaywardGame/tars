define(["require", "exports", "game/entity/action/IAction", "game/tile/Terrains", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteAction", "../../core/Restart", "./PickUpAllTileItems"], function (require, exports, IAction_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, ExecuteAction_1, Restart_1, PickUpAllTileItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ClearTile extends Objective_1.default {
        constructor(target, options) {
            super();
            this.target = target;
            this.options = options;
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
            if (!this.options?.skipDoodad && tile.doodad && !tile.doodad.canPickup(context.human)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xlYXJUaWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL29iamVjdGl2ZXMvb3RoZXIvdGlsZS9DbGVhclRpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBcUJBLE1BQXFCLFNBQVUsU0FBUSxtQkFBUztRQUU1QyxZQUE2QixNQUFnQixFQUFtQixPQUFvQztZQUNoRyxLQUFLLEVBQUUsQ0FBQztZQURpQixXQUFNLEdBQU4sTUFBTSxDQUFVO1lBQW1CLFlBQU8sR0FBUCxPQUFPLENBQTZCO1FBRXBHLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sYUFBYSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFFLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5RSxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxNQUFNLFVBQVUsR0FBaUI7Z0JBQzdCLElBQUksNEJBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUN0QyxDQUFDO1lBRUYsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFMUQsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JGLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRTtnQkFDakYsVUFBVSxDQUFDLElBQUksQ0FDWCxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDOUcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEVBQ2xDLElBQUksaUJBQU8sRUFBRSxDQUFDLENBQUM7YUFDdEI7WUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbkYsVUFBVSxDQUFDLElBQUksQ0FDWCxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2pILE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNqQyxJQUFJLGlCQUFPLEVBQUUsQ0FDaEIsQ0FBQzthQUNMO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3pDLFVBQVUsQ0FBQyxJQUFJLENBQ1gsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxvQkFBVSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUM7b0JBQ3pHLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUNqQyxJQUFJLGlCQUFPLEVBQUUsQ0FDaEIsQ0FBQzthQUNMO1lBRUQsT0FBTyxVQUFVLENBQUM7UUFDdEIsQ0FBQztLQUVKO0lBM0RELDRCQTJEQyJ9