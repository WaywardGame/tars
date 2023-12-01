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
define(["require", "exports", "../../core/objective/Objective", "../core/Restart", "../other/item/PlantSeed"], function (require, exports, Objective_1, Restart_1, PlantSeed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlantSeeds extends Objective_1.default {
        constructor(seeds) {
            super();
            this.seeds = seeds;
        }
        getIdentifier() {
            return `PlantSeeds:${this.seeds.join(",")}`;
        }
        getStatus() {
            return "Planting seeds";
        }
        async execute(context) {
            const objectivePipelines = [];
            for (const seed of this.seeds) {
                objectivePipelines.push([
                    new PlantSeed_1.default(seed),
                    new Restart_1.default(),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = PlantSeeds;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhbnRTZWVkcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvUGxhbnRTZWVkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O0dBU0c7Ozs7SUFTSCxNQUFxQixVQUFXLFNBQVEsbUJBQVM7UUFFaEQsWUFBNkIsS0FBYTtZQUN6QyxLQUFLLEVBQUUsQ0FBQTtZQURxQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBRTFDLENBQUM7UUFFTSxhQUFhO1lBQ25CLE9BQU8sY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQzdDLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxnQkFBZ0IsQ0FBQztRQUN6QixDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxNQUFNLGtCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFOUMsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQy9CLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQztvQkFDbkIsSUFBSSxpQkFBTyxFQUFFO2lCQUNiLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQTNCRCw2QkEyQkMifQ==