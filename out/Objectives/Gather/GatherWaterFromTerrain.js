define(["require", "exports", "game/entity/action/IAction", "../../core/navigation/INavigation", "../../core/objective/Objective", "../../utilities/Tile", "../core/MoveToTarget", "../other/item/UseItem", "../other/tile/PickUpAllTileItems"], function (require, exports, IAction_1, INavigation_1, Objective_1, Tile_1, MoveToTarget_1, UseItem_1, PickUpAllTileItems_1) {
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
        getStatus() {
            return `Gathering water into ${this.item.getName()} from terrain`;
        }
        async execute(context) {
            const objectivePipelines = [];
            const targets = await Tile_1.tileUtilities.getNearestTileLocation(context, INavigation_1.anyWaterTileLocation);
            for (const { tile, point } of targets) {
                if (tile.creature || tile.npc || context.island.isPlayerAtTile(tile)) {
                    continue;
                }
                objectivePipelines.push([
                    new MoveToTarget_1.default(point, true),
                    new PickUpAllTileItems_1.default(point),
                    new UseItem_1.default(IAction_1.ActionType.GatherLiquid, this.item)
                        .setStatus("Gathering water from terrain"),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = GatherWaterFromTerrain;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2F0aGVyV2F0ZXJGcm9tVGVycmFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL2dhdGhlci9HYXRoZXJXYXRlckZyb21UZXJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVlBLE1BQXFCLHNCQUF1QixTQUFRLG1CQUFTO1FBRTVELFlBQTZCLElBQVU7WUFDdEMsS0FBSyxFQUFFLENBQUM7WUFEb0IsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUV2QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLDBCQUEwQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLHdCQUF3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUM7UUFDbkUsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sT0FBTyxHQUFHLE1BQU0sb0JBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsa0NBQW9CLENBQUMsQ0FBQztZQUUxRixLQUFLLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksT0FBTyxFQUFFO2dCQUN0QyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDckUsU0FBUztpQkFDVDtnQkFFRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO29CQUM3QixJQUFJLDRCQUFrQixDQUFDLEtBQUssQ0FBQztvQkFDN0IsSUFBSSxpQkFBTyxDQUFDLG9CQUFVLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7eUJBQzdDLFNBQVMsQ0FBQyw4QkFBOEIsQ0FBQztpQkFDM0MsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQWxDRCx5Q0FrQ0MifQ==