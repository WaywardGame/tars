define(["require", "exports", "game/entity/action/actions/SailToIsland", "game/tile/ITerrain", "game/tile/Terrains", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, SailToIsland_1, ITerrain_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToWater extends Objective_1.default {
        constructor(ocean = true) {
            super();
            this.ocean = ocean;
        }
        getIdentifier() {
            return `MoveToWater:${this.ocean}`;
        }
        getStatus() {
            return this.ocean ? "Moving to the ocean" : "Moving to water";
        }
        async execute(context) {
            if (context.player.vehicleItemReference) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            if (this.ocean ? context.utilities.tile.isOverDeepSeaWater(context) : context.utilities.tile.isSwimmingOrOverWater(context)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const navigation = context.utilities.navigation;
            const disabledTiles = new Set();
            const target = TileHelpers_1.default.findMatchingTile(context.island, context.getPosition(), (_, point, tile) => {
                if (disabledTiles.has(tile)) {
                    return false;
                }
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && (this.ocean ? tileType === ITerrain_1.TerrainType.DeepSeawater : terrainDescription.water) &&
                    !navigation.isDisabledFromPoint(point)) {
                    if (this.ocean) {
                        const result = (0, SailToIsland_1.canSailAwayFromPosition)(context.player.island, point);
                        if (result.canSailAway) {
                            return true;
                        }
                        disabledTiles.addFrom(result.blockedTilesChecked);
                        return false;
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFZQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBNkIsUUFBUSxJQUFJO1lBQ3hDLEtBQUssRUFBRSxDQUFDO1lBRG9CLFVBQUssR0FBTCxLQUFLLENBQU87UUFFekMsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRU0sU0FBUztZQUNmLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQy9ELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRTtnQkFFeEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM1SCxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7WUFFaEQsTUFBTSxhQUFhLEdBQWUsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUU1QyxNQUFNLE1BQU0sR0FBRyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDckcsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUM1QixPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFFRCxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLGtCQUFrQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxLQUFLLHNCQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUM7b0JBQ3hHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUd4QyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7d0JBQ2YsTUFBTSxNQUFNLEdBQUcsSUFBQSxzQ0FBdUIsRUFBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDckUsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFOzRCQUN2QixPQUFPLElBQUksQ0FBQzt5QkFDWjt3QkFFRCxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO3dCQUVsRCxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN4RixDQUFDO0tBRUQ7SUEvREQsOEJBK0RDIn0=