define(["require", "exports", "game/tile/ITerrain", "game/WorldZ", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../../utilities/Tile", "../../contextData/SetContextData", "../../core/MoveToTarget"], function (require, exports, ITerrain_1, WorldZ_1, IContext_1, IObjective_1, Objective_1, Tile_1, SetContextData_1, MoveToTarget_1) {
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
        getStatus() {
            return `Moving to ${WorldZ_1.WorldZ[this.z]}`;
        }
        async execute(context) {
            if (context.player.z === this.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const tileLocations = await Tile_1.tileUtilities.getNearestTileLocation(context, ITerrain_1.TerrainType.CaveEntrance);
            for (const tileLocation of tileLocations) {
                objectivePipelines.push([
                    new MoveToTarget_1.default(tileLocation.point, false),
                    new SetContextData_1.default(IContext_1.ContextDataType.Position, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb1oudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLENBQVM7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEb0IsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUV0QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hDLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxvQkFBYSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxzQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXBHLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO2dCQUN6QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksc0JBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztvQkFDM0MsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsUUFBUSxFQUFFO3dCQUM1QyxDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QixDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QixDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssZUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLFNBQVM7cUJBQzdFLENBQUM7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXJDRCwwQkFxQ0MifQ==