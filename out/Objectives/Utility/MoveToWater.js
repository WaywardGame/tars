define(["require", "exports", "game/tile/Terrains", "utilities/game/TileHelpers", "../../IObjective", "../../ITars", "../../navigation/Navigation", "../../Objective", "../../utilities/Tile", "../core/MoveToTarget"], function (require, exports, Terrains_1, TileHelpers_1, IObjective_1, ITars_1, Navigation_1, Objective_1, Tile_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToWater extends Objective_1.default {
        constructor(deepWater = true) {
            super();
            this.deepWater = deepWater;
        }
        getIdentifier() {
            return `MoveToWater:${this.deepWater}`;
        }
        getStatus() {
            return "Moving to water";
        }
        async execute(context) {
            if (this.deepWater ? Tile_1.tileUtilities.isOverDeepWater(context) : Tile_1.tileUtilities.isOverWater(context)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const navigation = Navigation_1.default.get();
            const target = TileHelpers_1.default.findMatchingTile(context.getPosition(), (point, tile) => {
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && (this.deepWater ? terrainDescription.deepWater : terrainDescription.water) &&
                    !navigation.isDisabledFromPoint(point)) {
                    return true;
                }
                return false;
            }, { maxTilesChecked: ITars_1.defaultMaxTilesChecked });
            if (!target) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return new MoveToTarget_1.default(target, false, { allowBoat: true, disableStaminaCheck: true });
        }
    }
    exports.default = MoveToWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L01vdmVUb1dhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixZQUFZLElBQUk7WUFDNUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsY0FBUyxHQUFULFNBQVMsQ0FBTztRQUU3QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9CQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDakcsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sVUFBVSxHQUFHLG9CQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFcEMsTUFBTSxNQUFNLEdBQUcscUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ2xGLE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlDLElBQUksa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztvQkFDbkcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBRXhDLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxPQUFPLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3hGLENBQUM7S0FFRDtJQXhDRCw4QkF3Q0MifQ==