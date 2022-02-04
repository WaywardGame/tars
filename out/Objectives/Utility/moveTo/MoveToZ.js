define(["require", "exports", "game/tile/ITerrain", "game/WorldZ", "../../../core/context/IContext", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../contextData/SetContextData", "../../core/MoveToTarget"], function (require, exports, ITerrain_1, WorldZ_1, IContext_1, IObjective_1, Objective_1, SetContextData_1, MoveToTarget_1) {
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
            if (context.human.z === this.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const tileLocations = await context.utilities.tile.getNearestTileLocation(context, ITerrain_1.TerrainType.CaveEntrance);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb1oudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBV0EsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLENBQVM7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEb0IsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUV0QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsc0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUU3RyxLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtnQkFDekMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLHNCQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7b0JBQzNDLElBQUksd0JBQWMsQ0FBQywwQkFBZSxDQUFDLFFBQVEsRUFBRTt3QkFDNUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkIsQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkIsQ0FBQyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLGVBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxTQUFTO3FCQUM3RSxDQUFDO2lCQUNGLENBQUMsQ0FBQzthQUNIO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUFyQ0QsMEJBcUNDIn0=