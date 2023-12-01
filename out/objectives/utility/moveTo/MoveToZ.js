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
define(["require", "exports", "@wayward/game/game/tile/ITerrain", "@wayward/utilities/game/WorldZ", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/MoveToTarget"], function (require, exports, ITerrain_1, WorldZ_1, IObjective_1, Objective_1, MoveToTarget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveToZ extends Objective_1.default {
        constructor(z) {
            super();
            this.z = z;
        }
        getIdentifier() {
            return `MoveToZ:${this.z}`;
        }
        getStatus() {
            return `Moving to ${WorldZ_1.WorldZ[this.z]}`;
        }
        async execute(context) {
            if (context.human.z === this.z) {
                return IObjective_1.ObjectiveResult.Complete;
            }
            const objectivePipelines = [];
            const tileLocations = context.utilities.tile.getNearestTileLocation(context, ITerrain_1.TerrainType.CaveEntrance);
            for (const tileLocation of tileLocations) {
                objectivePipelines.push([
                    new MoveToTarget_1.default(tileLocation.tile, false, { idleIfAlreadyThere: true, changeZ: tileLocation.tile.z === WorldZ_1.WorldZ.Overworld ? WorldZ_1.WorldZ.Cave : WorldZ_1.WorldZ.Overworld }),
                ]);
            }
            return objectivePipelines;
        }
    }
    exports.default = MoveToZ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW92ZVRvWi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL3V0aWxpdHkvbW92ZVRvL01vdmVUb1oudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztHQVNHOzs7O0lBV0gsTUFBcUIsT0FBUSxTQUFRLG1CQUFTO1FBRTdDLFlBQTZCLENBQVM7WUFDckMsS0FBSyxFQUFFLENBQUM7WUFEb0IsTUFBQyxHQUFELENBQUMsQ0FBUTtRQUV0QyxDQUFDO1FBRU0sYUFBYTtZQUNuQixPQUFPLFdBQVcsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTSxTQUFTO1lBQ2YsT0FBTyxhQUFhLGVBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFnQjtZQUNwQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyw0QkFBZSxDQUFDLFFBQVEsQ0FBQztZQUNqQyxDQUFDO1lBRUQsTUFBTSxrQkFBa0IsR0FBbUIsRUFBRSxDQUFDO1lBRTlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxzQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRXZHLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFLENBQUM7Z0JBQzFDLGtCQUFrQixDQUFDLElBQUksQ0FBQztvQkFDdkIsSUFBSSxzQkFBWSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxlQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7aUJBQzVKLENBQUMsQ0FBQztZQUNKLENBQUM7WUFFRCxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FFRDtJQWhDRCwwQkFnQ0MifQ==