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
            const growingStage = this.doodad.getGrowingStage();
            const harvestLoot = growingStage !== undefined ? this.doodad.description()?.harvest?.[growingStage] : growingStage;
            if (harvestLoot === undefined) {
                return IObjective_1.ObjectiveResult.Impossible;
            }
            const itemTypes = harvestLoot.map(loot => loot.type);
            return [
                new MoveToTarget_1.default(this.doodad, true),
                new ClearTile_1.default(this.doodad, { skipDoodad: true }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdERvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2Rvb2RhZC9IYXJ2ZXN0RG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixNQUFjO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFbkQsTUFBTSxXQUFXLEdBQUcsWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ25ILElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckQsT0FBTztnQkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksbUJBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUNoRCxJQUFJLDhCQUFvQixDQUNwQix3Q0FBaUIsQ0FBQyxNQUFNLEVBQ3hCLFNBQVMsRUFDVDtvQkFDSSxtQkFBbUIsRUFBRSxJQUFJO29CQUN6QixtQkFBbUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLHFCQUFxQjtvQkFDMUQsb0JBQW9CLEVBQUUsSUFBSTtpQkFDN0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RCLElBQUksaUJBQU8sRUFBRTthQUNoQixDQUFDO1FBQ04sQ0FBQztLQUNKO0lBdENELGdDQXNDQyJ9