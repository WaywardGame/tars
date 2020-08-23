define(["require", "exports", "game/WorldZ", "tile/ITerrain", "../../Context", "../../IObjective", "../../Objective", "../../Utilities/Tile", "../ContextData/SetContextData", "../Core/MoveToTarget"], function (require, exports, WorldZ_1, ITerrain_1, Context_1, IObjective_1, Objective_1, Tile_1, SetContextData_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToZ extends Objective_1.default {
        constructor(z) {
            super();
            this.z = z;
        }
        getIdentifier() {
            return `MoveToZ:${this.z}`;
        }
        async execute(context) {
            if (context.player.z === this.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const tileLocations = await Tile_1.getNearestTileLocation(context, ITerrain_1.TerrainType.CaveEntrance);
            for (const tileLocation of tileLocations) {
                objectivePipelines.push([
                    new MoveToTarget_1.default(tileLocation.point, false),
                    new SetContextData_1.default(Context_1.ContextDataType.Position, {
                        x: tileLocation.point.x,
                        y: tileLocation.point.y,
                        z: tileLocation.point.z === WorldZ_1.WorldZ.Overworld ? WorldZ_1.WorldZ.Cave : WorldZ_1.WorldZ.Overworld,
                    }),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToZ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9PYmplY3RpdmVzL1V0aWxpdHkvTW92ZVRvWi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsQ0FBUztZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURvQixNQUFDLEdBQUQsQ0FBQyxDQUFRO1FBRXRDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sV0FBVyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUNoQyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sYUFBYSxHQUFHLE1BQU0sNkJBQXNCLENBQUMsT0FBTyxFQUFFLHNCQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFdEYsS0FBSyxNQUFNLFlBQVksSUFBSSxhQUFhLEVBQUU7Z0JBQ3pDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxzQkFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO29CQUMzQyxJQUFJLHdCQUFjLENBQUMseUJBQWUsQ0FBQyxRQUFRLEVBQUU7d0JBQzVDLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZCLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZCLENBQUMsRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxlQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsU0FBUztxQkFDN0UsQ0FBQztpQkFDRixDQUFDLENBQUM7YUFDSDtZQUVELE9BQU8sa0JBQWtCLENBQUM7UUFDM0IsQ0FBQztLQUVEO0lBakNELDBCQWlDQyJ9