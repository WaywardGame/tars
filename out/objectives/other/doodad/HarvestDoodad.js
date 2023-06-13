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
define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/Restart", "../tile/ClearTile"], function (require, exports, IObjective_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, Restart_1, ClearTile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class HarvestDoodad extends Objective_1.default {
        constructor(doodad) {
            super();
            this.doodad = doodad;
        }
        getIdentifier() {
            return `HarvestDoodad:${this.doodad}`;
        }
        getStatus() {
            return `Harvesting from ${this.doodad.getName()}`;
        }
        async execute(context) {
            const growingStage = this.doodad.growth;
            const harvestLoot = growingStage !== undefined ? this.doodad.description?.harvest?.[growingStage] : growingStage;
            if (harvestLoot === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemTypes = harvestLoot.map(loot => loot.type);
            return [
                new MoveToTarget_1.default(this.doodad, true),
                new ClearTile_1.default(this.doodad.tile, { skipDoodad: true }),
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Doodad, itemTypes, {
                    onlyAllowHarvesting: true,
                    onlyGatherWithHands: context.options.harvesterOnlyUseHands,
                    moveAllMatchingItems: true,
                }).setStatus(this),
                new Restart_1.default(),
            ];
        }
    }
    exports.default = HarvestDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdERvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2Rvb2RhZC9IYXJ2ZXN0RG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7R0FTRzs7OztJQWFILE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixNQUFjO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBRXhDLE1BQU0sV0FBVyxHQUFHLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7WUFDakgsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUMzQixPQUFPLDRCQUFlLENBQUMsVUFBVSxDQUFDO2FBQ3JDO1lBRUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyRCxPQUFPO2dCQUNILElBQUksc0JBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztnQkFDbkMsSUFBSSxtQkFBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUNyRCxJQUFJLDhCQUFvQixDQUNwQix3Q0FBaUIsQ0FBQyxNQUFNLEVBQ3hCLFNBQVMsRUFDVDtvQkFDSSxtQkFBbUIsRUFBRSxJQUFJO29CQUN6QixtQkFBbUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQjtvQkFDMUQsb0JBQW9CLEVBQUUsSUFBSTtpQkFDN0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksaUJBQU8sRUFBRTthQUNoQixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBdENELGdDQXNDQyJ9