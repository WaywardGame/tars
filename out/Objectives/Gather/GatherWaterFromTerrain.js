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
            const targets = await Tile_1.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
            for (const { tile, point } of targets) {
                if (tile.creature || tile.npc || game.isPlayerAtTile(tile)) {
                    continue;
                }
                const objectives = [];
                objectives.push(new MoveToTarget_1.default(point, true));
                objectives.push(new Lambda_1.default(async (context) => {
                    const objectives = [];
                    if (game.isTileFull(context.player.getFacingTile())) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.PickupAllItems, (context, action) => {
                            action.execute(context.player);
                        }).setStatus("Picking up all items from full tile"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tVGVycmFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJXYXRlckZyb21UZXJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLElBQVU7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUV2QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDBCQUEwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sNkJBQXNCLENBQUMsT0FBTyxFQUFFLGtDQUFvQixDQUFDLENBQUM7WUFFNUUsS0FBSyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLE9BQU8sRUFBRTtnQkFDdEMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDM0QsU0FBUztpQkFDVDtnQkFFRCxNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFL0MsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGdCQUFNLENBQUMsS0FBSyxFQUFFLE9BQWdCLEVBQUUsRUFBRTtvQkFDckQsTUFBTSxVQUFVLEdBQWlCLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRTt3QkFDcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQ2hGLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDO3FCQUNyRDtvQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQWEsQ0FBQyxvQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTt3QkFDekUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsb0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDbkUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztvQkFFOUMsT0FBTyxVQUFVLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUosa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUE3Q0QseUNBNkNDIn0=