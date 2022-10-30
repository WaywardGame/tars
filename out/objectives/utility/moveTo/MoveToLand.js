define(["require", "exports", "game/tile/Terrains", "utilities/game/TileHelpers", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../../core/ITars"], function (require, exports, Terrains_1, TileHelpers_1, IObjective_1, Objective_1, MoveToTarget_1, ITars_1) {
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
            if (!context.utilities.tile.isSwimmingOrOverWater(context)) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const navigation = context.utilities.navigation;
            const target = TileHelpers_1.default.findMatchingTile(context.island, context.getPosition(), (_, point, tile) => {
                const tileType = TileHelpers_1.default.getType(tile);
                const terrainDescription = Terrains_1.default[tileType];
                if (terrainDescription && !terrainDescription.water &&
                    !navigation.isDisabledFromPoint(context.island, point) && navigation.getPenaltyFromPoint(context.island, point) === 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTGFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb0xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBRXpDLGFBQWE7WUFDbkIsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0QsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO1lBRWhELE1BQU0sTUFBTSxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNyRyxNQUFNLFFBQVEsR0FBRyxxQkFBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxrQkFBa0IsR0FBRyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLGtCQUFrQixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSztvQkFDbEQsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBRXZILE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxPQUFPLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBRUQ7SUFwQ0QsNkJBb0NDIn0=