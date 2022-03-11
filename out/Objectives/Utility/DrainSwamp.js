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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhaW5Td2FtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvRHJhaW5Td2FtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFVQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsS0FBaUI7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFEaUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUU5QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDakM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUM3QixrQkFBa0IsQ0FBQyxJQUFJLENBQUM7b0JBQ3BCLElBQUksaUJBQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxzQkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUM3RCxJQUFJLGlCQUFPLEVBQUU7aUJBQ2hCLENBQUMsQ0FBQzthQUNOO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUFoQ0QsNkJBZ0NDIn0=