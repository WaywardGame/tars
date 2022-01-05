define(["require", "exports", "game/tile/ITerrain", "../../core/objective/IObjective", "../../core/objective/Objective", "../other/tile/DigTile", "../core/Restart", "../../utilities/Tile", "../other/tile/PickUpAllTileItems"], function (require, exports, ITerrain_1, IObjective_1, Objective_1, DigTile_1, Restart_1, Tile_1, PickUpAllTileItems_1) {
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
                const objectives = [];
                const tile = context.island.getTileFromPoint(target);
                if (!Tile_1.tileUtilities.canDig(context, tile)) {
                    if (!Tile_1.tileUtilities.hasItems(tile)) {
                        continue;
                    }
                    objectives.push(new PickUpAllTileItems_1.default(target));
                }
                objectives.push(new DigTile_1.default(target, { digUntilTypeIsNot: ITerrain_1.TerrainType.Swamp }), new Restart_1.default());
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = DrainSwamp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhaW5Td2FtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvRHJhaW5Td2FtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsS0FBaUI7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFEaUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUU5QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDakM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUM3QixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxJQUFJLENBQUMsb0JBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUN0QyxJQUFJLENBQUMsb0JBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQy9CLFNBQVM7cUJBQ1o7b0JBRUQsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQ25EO2dCQUVELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLGlCQUFpQixFQUFFLHNCQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLGlCQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUU5RixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzlCLENBQUM7S0FFSjtJQTFDRCw2QkEwQ0MifQ==