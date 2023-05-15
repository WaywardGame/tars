/*!
 * Copyright 2011-2023 Unlok
 * https://www.unlok.ca
 *
 * Credits & Thanks:
 * https://www.unlok.ca/credits-thanks/
 *
 * Wayward is a copyrighted and licensed work. Modification and/or distribution of any source files is prohibited. If you wish to modify the game in any way, please refer to the modding guide:
 * https://github.com/WaywardGame/types/wiki
 */
define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget", "../../../core/ITars"], function (require, exports, IObjective_1, Objective_1, MoveToTarget_1, ITars_1) {
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
            const target = context.getTile().findMatchingTile((tile) => {
                const terrainDescription = tile.description;
                if (terrainDescription && !terrainDescription.water &&
                    !navigation.isDisabled(tile) && navigation.getPenalty(tile) === 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvTGFuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb0xhbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBU0gsTUFBcUIsVUFBVyxTQUFRLG1CQUFTO1FBRXpDLGFBQWE7WUFDbkIsT0FBTyxZQUFZLENBQUM7UUFDckIsQ0FBQztRQUVNLFNBQVM7WUFDZixPQUFPLGdCQUFnQixDQUFDO1FBQ3pCLENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0QsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQzthQUNoQztZQUVELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO1lBRWhELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUMxRCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQzVDLElBQUksa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO29CQUNsRCxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBRW5FLE9BQU8sSUFBSSxDQUFDO2lCQUNaO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLDhCQUFzQixFQUFFLENBQUMsQ0FBQztZQUVoRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDbEM7WUFFRCxPQUFPLElBQUksc0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO0tBRUQ7SUFuQ0QsNkJBbUNDIn0=