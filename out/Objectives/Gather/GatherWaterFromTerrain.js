define(["require", "exports", "game/entity/action/IAction", "../../navigation//INavigation", "../../Objective", "../../utilities/Tile", "../core/ExecuteAction", "../core/Lambda", "../core/MoveToTarget"], function (require, exports, IAction_1, INavigation_1, Objective_1, Tile_1, ExecuteAction_1, Lambda_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GatherWaterFromTerrain extends Objective_1.default {
        constructor(item) {
            super();
            this.item = item;
        }
        getIdentifier() {
            return `GatherWaterFromTerrain:${this.item}`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const targets = await Tile_1.tileUtilities.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
            for (const { tile, point } of targets) {
                if (tile.creature || tile.npc || game.isPlayerAtTile(tile)) {
                    continue;
                }
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new Lambda_1.default(async (context) => {
                    const objectives = [];
                    if (game.isTileFull(context.player.getFacingTile())) {
                        for (const item of tile.containedItems) {
                            objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                                action.execute(context.player, item, context.player.inventory);
                            }));
                        }
                    }
                    objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.UseItem, (context, action) => {
                        action.execute(context.player, this.item, IAction_1.ActionType.GatherWater);
                    }).setStatus("Gathering water from terrain"));
                    return objectives;
                }));
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherWaterFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tVGVycmFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJXYXRlckZyb21UZXJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLElBQVU7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUV2QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDBCQUEwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sb0JBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsa0NBQW9CLENBQUMsQ0FBQztZQUUxRixLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFO2dCQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUMzRCxTQUFTO2lCQUNUO2dCQUVELE1BQU0sVUFBVSxHQUFpQixFQUFFLENBQUM7Z0JBRXBDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUUvQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksZ0JBQU0sQ0FBQyxLQUFLLEVBQUUsT0FBZ0IsRUFBRSxFQUFFO29CQUNyRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO29CQUVwQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFO3dCQUNwRCxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFlLEVBQUU7NEJBQ3hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBYSxDQUFDLG9CQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dDQUMxRSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2hFLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ0o7cUJBQ0Q7b0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7d0JBQ3pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ25FLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7b0JBRTlDLE9BQU8sVUFBVSxDQUFDO2dCQUNuQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBL0NELHlDQStDQyJ9