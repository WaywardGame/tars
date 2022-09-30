define(["require", "exports", "game/tile/ITerrain", "game/WorldZ", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, ITerrain_1, WorldZ_1, IObjective_1, Objective_1, MoveToTarget_1) {
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
                    new MoveToTarget_1.default(tileLocation.point, false, { idleIfAlreadyThere: true, changeZ: tileLocation.point.z === WorldZ_1.WorldZ.Overworld ? WorldZ_1.WorldZ.Cave : WorldZ_1.WorldZ.Overworld }),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToZ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb1oudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0EsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLENBQVM7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEb0IsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUV0QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQy9CLE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsc0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUU3RyxLQUFLLE1BQU0sWUFBWSxJQUFJLGFBQWEsRUFBRTtnQkFDekMsa0JBQWtCLENBQUMsSUFBSSxDQUFDO29CQUN2QixJQUFJLHNCQUFZLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLGVBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGVBQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztpQkFDOUosQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQWhDRCwwQkFnQ0MifQ==