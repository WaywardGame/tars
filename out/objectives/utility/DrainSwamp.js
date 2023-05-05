define(["require", "exports", "game/tile/ITerrain", "../../core/objective/IObjective", "../../core/objective/Objective", "../other/tile/DigTile", "../core/Restart"], function (require, exports, ITerrain_1, IObjective_1, Objective_1, DigTile_1, Restart_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DrainSwamp extends Objective_1.default {
        constructor(tiles) {
            super();
            this.tiles = tiles;
        }
        getIdentifier() {
            return "DrainSwamp";
        }
        getStatus() {
            return "Draining swamp";
        }
        async execute(context) {
            if (this.tiles.length === 0) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            const objectivePipelines = [];
            for (const target of this.tiles) {
                objectivePipelines.push([
                    new DigTile_1.default(target, { digUntilTypeIsNot: ITerrain_1.TerrainType.Swamp }),
                    new Restart_1.default(),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = DrainSwamp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhaW5Td2FtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvRHJhaW5Td2FtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsS0FBYTtZQUN0QyxLQUFLLEVBQUUsQ0FBQztZQURpQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRTFDLENBQUM7UUFFTSxhQUFhO1lBQ2hCLE9BQU8sWUFBWSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNqQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDekIsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUNqQztZQUVELE1BQU0sa0JBQWtCLEdBQW1CLEVBQUUsQ0FBQztZQUc5QyxLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQzdCLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDcEIsSUFBSSxpQkFBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLGlCQUFpQixFQUFFLHNCQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzdELElBQUksaUJBQU8sRUFBRTtpQkFDaEIsQ0FBQyxDQUFDO2FBQ047WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7S0FFSjtJQWhDRCw2QkFnQ0MifQ==