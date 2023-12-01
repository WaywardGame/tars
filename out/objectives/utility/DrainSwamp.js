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
define(["require", "exports", "@wayward/game/game/tile/ITerrain", "../../core/objective/IObjective", "../../core/objective/Objective", "../core/Restart", "../other/tile/DigTile"], function (require, exports, ITerrain_1, IObjective_1, Objective_1, Restart_1, DigTile_1) {
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
                objectivePipelines.push([
                    new DigTile_1.default(target, { digUntilTypeIsNot: ITerrain_1.TerrainType.Swamp }),
                    new Restart_1.default(),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = DrainSwamp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRHJhaW5Td2FtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvRHJhaW5Td2FtcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFZSCxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFaEQsWUFBNkIsS0FBYTtZQUN6QyxLQUFLLEVBQUUsQ0FBQztZQURvQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRTFDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUM3QixPQUFPLDRCQUFlLENBQUMsTUFBTSxDQUFDO1lBQy9CLENBQUM7WUFFRCxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFHOUMsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxpQkFBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLGlCQUFpQixFQUFFLHNCQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzdELElBQUksaUJBQU8sRUFBRTtpQkFDYixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsT0FBTyxrQkFBa0IsQ0FBQztRQUMzQixDQUFDO0tBRUQ7SUFoQ0QsNkJBZ0NDIn0=