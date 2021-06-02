define(["require", "exports", "game/tile/Terrains", "utilities/game/TileHelpers", "../../IObjective", "../../ITars", "../../navigation/Navigation", "../../Objective", "../../utilities/Tile", "../core/MoveToTarget"], function (require, exports, Terrains_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Objective_1, Tile_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToLand extends Objective_1.default {
        getIdentifier() {
            return "MoveToLand";
        }
        getStatus() {
            return "Moving to land";
        }
        async execute(context) {
            if (!Tile_1.tileUtilities.isOverWater(context)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const navigation = Navigation_1.default.get();
            const target = TileHelpers_1.default.findMatchingTile(context.getPosition(), (point, tile) => {
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && !terrainDescription.water &&
                    !navigation.isDisabledFromPoint(point) && navigation.getPenaltyFromPoint(point) === 0) {
                    return true;
                }
                return false;
            }, { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
            if (!target) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return new MoveToTarget_1.default(target, false, { disableStaminaCheck: true });
        }
    }
    exports.default = MoveToLand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTGFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvTW92ZVRvTGFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFekMsYUFBYTtZQUNuQixPQUFPLFlBQVksQ0FBQztRQUNyQixDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sZ0JBQWdCLENBQUM7UUFDekIsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxDQUFDLG9CQUFhLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVwQyxNQUFNLE1BQU0sR0FBRyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbEYsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUs7b0JBQ2xELENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBRXZGLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxPQUFPLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBRUQ7SUFwQ0QsNkJBb0NDIn0=