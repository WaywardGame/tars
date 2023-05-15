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
define(["require", "exports", "utilities/math/Vector2", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, Vector2_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const returnToBaseDistance = 20;
    const returnToBaseDistanceSq = Math.pow(returnToBaseDistance, 2);
    class MoveToBase extends Objective_1.default {
        getIdentifier() {
            return "MoveToBase";
        }
        getStatus() {
            return "Moving to the base";
        }
        async execute(context) {
            const tile = context.getTile();
            const baseTile = context.utilities.base.getBaseTile(context);
            if (tile.z === baseTile.z && Vector2_1.default.squaredDistance(tile, baseTile) <= returnToBaseDistanceSq) {
                return IObjective_1.ObjectiveResult.Ignore;
            }
            this.log.info("Returning to base");
            return new MoveToTarget_1.default(baseTile, true);
        }
    }
    exports.default = MoveToBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvQmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb0Jhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBVUgsTUFBTSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7SUFDaEMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRWpFLE1BQXFCLFVBQVcsU0FBUSxtQkFBUztRQUV6QyxhQUFhO1lBQ25CLE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxvQkFBb0IsQ0FBQztRQUM3QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdELElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxJQUFJLGlCQUFPLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxzQkFBc0IsRUFBRTtnQkFDL0YsT0FBTyw0QkFBZSxDQUFDLE1BQU0sQ0FBQzthQUM5QjtZQUVELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFFbkMsT0FBTyxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FFRDtJQXRCRCw2QkFzQkMifQ==