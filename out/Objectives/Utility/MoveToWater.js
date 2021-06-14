define(["require", "exports", "game/tile/Terrains", "utilities/game/TileHelpers", "../../IObjective", "../../navigation/Navigation", "../../Objective", "../../utilities/Tile", "../core/MoveToTarget"], function (require, exports, Terrains_1, TileHelpers_1, IObjective_1, Navigation_1, Objective_1, Tile_1, MoveToTarget_1) {
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
            if (this.deepWater ? Tile_1.tileUtilities.isOverDeepWater(context) : Tile_1.tileUtilities.isSwimmingOrOverWater(context)) {
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
            });
            if (!target) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return new MoveToTarget_1.default(target, false, { allowBoat: true, disableStaminaCheck: true });
        }
    }
    exports.default = MoveToWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L01vdmVUb1dhdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLE1BQXFCLFdBQVksU0FBUSxtQkFBUztRQUVqRCxZQUE2QixZQUFZLElBQUk7WUFDNUMsS0FBSyxFQUFFLENBQUM7WUFEb0IsY0FBUyxHQUFULFNBQVMsQ0FBTztRQUU3QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLGVBQWUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxpQkFBaUIsQ0FBQztRQUMxQixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9CQUFhLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBYSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzRyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxVQUFVLEdBQUcsb0JBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVwQyxNQUFNLE1BQU0sR0FBRyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDbEYsTUFBTSxRQUFRLEdBQUcscUJBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNDLE1BQU0sa0JBQWtCLEdBQUcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUMsSUFBSSxrQkFBa0IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDO29CQUNuRyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFFeEMsT0FBTyxJQUFJLENBQUM7aUJBQ1o7Z0JBRUQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNsQztZQUVELE9BQU8sSUFBSSxzQkFBWSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDeEYsQ0FBQztLQUVEO0lBeENELDhCQXdDQyJ9