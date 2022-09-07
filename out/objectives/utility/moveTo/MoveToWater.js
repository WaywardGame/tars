define(["require", "exports", "game/tile/ITerrain", "game/tile/Terrains", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, ITerrain_1, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToWater extends Objective_1.default {
        constructor(ocean = true, allowBoat = true) {
            super();
            this.ocean = ocean;
            this.allowBoat = allowBoat;
        }
        getIdentifier() {
            return `MoveToWater:${this.ocean}:${this.allowBoat}`;
        }
        getStatus() {
            return this.ocean ? "Moving to the ocean" : "Moving to water";
        }
        async execute(context) {
            if (context.human.vehicleItemReference) {
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
                        const result = context.human.canSailAwayFromPosition(context.human.island, point);
                        if (result.canSailAway) {
                            return true;
                        }
                        if (result.blockedTilesChecked) {
                            disabledTiles.addFrom(result.blockedTilesChecked);
                        }
                        return false;
                    }
                    return true;
                }
                return false;
            });
            if (!target) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            return new MoveToTarget_1.default(target, false, { allowBoat: this.allowBoat, disableStaminaCheck: true });
        }
    }
    exports.default = MoveToWater;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvV2F0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvb2JqZWN0aXZlcy91dGlsaXR5L21vdmVUby9Nb3ZlVG9XYXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFXQSxNQUFxQixXQUFZLFNBQVEsbUJBQVM7UUFFakQsWUFBNkIsUUFBUSxJQUFJLEVBQW1CLFlBQVksSUFBSTtZQUMzRSxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQW1CLGNBQVMsR0FBVCxTQUFTLENBQU87UUFFNUUsQ0FBQztRQUVNLGFBQWE7WUFDbkIsT0FBTyxlQUFlLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7UUFDL0QsQ0FBQztRQUVNLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7WUFDcEMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFO2dCQUV2QyxPQUFPLDRCQUFlLENBQUMsUUFBUSxDQUFDO2FBQ2hDO1lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzVILE9BQU8sNEJBQWUsQ0FBQyxRQUFRLENBQUM7YUFDaEM7WUFFRCxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztZQUVoRCxNQUFNLGFBQWEsR0FBZSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBRTVDLE1BQU0sTUFBTSxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNyRyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzVCLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELE1BQU0sUUFBUSxHQUFHLHFCQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLGtCQUFrQixHQUFHLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlDLElBQUksa0JBQWtCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssc0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztvQkFDeEcsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBR3hDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTt3QkFDZixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUNsRixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7NEJBQ3ZCLE9BQU8sSUFBSSxDQUFDO3lCQUNaO3dCQUVELElBQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFOzRCQUMvQixhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO3lCQUNsRDt3QkFFRCxPQUFPLEtBQUssQ0FBQztxQkFDYjtvQkFFRCxPQUFPLElBQUksQ0FBQztpQkFDWjtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ2xDO1lBRUQsT0FBTyxJQUFJLHNCQUFZLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEcsQ0FBQztLQUVEO0lBakVELDhCQWlFQyJ9