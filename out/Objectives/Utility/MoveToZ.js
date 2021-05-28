define(["require", "exports", "game/tile/ITerrain", "game/WorldZ", "../../IContext", "../../IObjective", "../../Objective", "../../utilities/Tile", "../contextData/SetContextData", "../core/MoveToTarget"], function (require, exports, ITerrain_1, WorldZ_1, IContext_1, IObjective_1, Objective_1, Tile_1, SetContextData_1, MoveToTarget_1) {
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
            const tileLocations = await Tile_1.getNearestTileLocation(context, ITerrain_1.TerrainType.CaveEntrance);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvTW92ZVRvWi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixPQUFRLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsQ0FBUztZQUNyQyxLQUFLLEVBQUUsQ0FBQztZQURvQixNQUFDLEdBQUQsQ0FBQyxDQUFRO1FBRXRDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sV0FBVyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGFBQWEsZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDaEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUU5QyxNQUFNLGFBQWEsR0FBRyxNQUFNLDZCQUFzQixDQUFDLE9BQU8sRUFBRSxzQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXRGLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFO2dCQUN6QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3ZCLElBQUksc0JBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztvQkFDM0MsSUFBSSx3QkFBYyxDQUFDLDBCQUFlLENBQUMsUUFBUSxFQUFFO3dCQUM1QyxDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QixDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2QixDQUFDLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssZUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBTSxDQUFDLFNBQVM7cUJBQzdFLENBQUM7aUJBQ0YsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQXJDRCwwQkFxQ0MifQ==