define(["require", "exports", "game/tile/ITerrain", "game/entity/action/IAction", "../../IObjective", "../../Objective", "../other/tile/DigTile", "../core/Restart", "../core/ExecuteAction", "../../utilities/Tile"], function (require, exports, ITerrain_1, IAction_1, IObjective_1, Objective_1, DigTile_1, Restart_1, ExecuteAction_1, Tile_1) {
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
                const tile = game.getTileFromPoint(target);
                if (!Tile_1.tileUtilities.canDig(tile)) {
                    if (!Tile_1.tileUtilities.hasItems(tile)) {
                        continue;
                    }
                    for (const item of tile.containedItems) {
                        objectives.push(new ExecuteAction_1.default(IAction_1.ActionType.MoveItem, (context, action) => {
                            action.execute(context.player, item, context.player.inventory);
                        }));
                    }
                }
                objectives.push(new DigTile_1.default(target, { digUntilTypeIsNot: ITerrain_1.TerrainType.Swamp }), new Restart_1.default());
                objectivePipelines.push(objectives);
            }
            return objectivePipelines;
        }
    }
    exports.default = DrainSwamp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhaW5Td2FtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvRHJhaW5Td2FtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFN0MsWUFBNkIsS0FBaUI7WUFDMUMsS0FBSyxFQUFFLENBQUM7WUFEaUIsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUU5QyxDQUFDO1FBRU0sYUFBYTtZQUNoQixPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO1FBRU0sU0FBUztZQUNaLE9BQU8sZ0JBQWdCLENBQUM7UUFDNUIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sNEJBQWUsQ0FBQyxNQUFNLENBQUM7YUFDakM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUM3QixNQUFNLFVBQVUsR0FBaUIsRUFBRSxDQUFDO2dCQUVwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLG9CQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUMvQixTQUFTO3FCQUNaO29CQUVELEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWUsRUFBRTt3QkFDckMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFhLENBQUMsb0JBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7NEJBQ3ZFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDUDtpQkFDSjtnQkFFRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxzQkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxpQkFBTyxFQUFFLENBQUMsQ0FBQztnQkFFOUYsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3ZDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUM5QixDQUFDO0tBRUo7SUE5Q0QsNkJBOENDIn0=