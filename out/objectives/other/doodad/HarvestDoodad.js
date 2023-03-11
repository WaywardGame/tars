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
            const harvestLoot = growingStage !== undefined ? this.doodad.description()?.harvest?.[growingStage] : growingStage;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdERvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2Rvb2RhZC9IYXJ2ZXN0RG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixNQUFjO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBRXhDLE1BQU0sV0FBVyxHQUFHLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztZQUNuSCxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQzNCLE9BQU8sNEJBQWUsQ0FBQyxVQUFVLENBQUM7YUFDckM7WUFFRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXJELE9BQU87Z0JBQ0gsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO2dCQUNuQyxJQUFJLG1CQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUM7Z0JBQ3JELElBQUksOEJBQW9CLENBQ3BCLHdDQUFpQixDQUFDLE1BQU0sRUFDeEIsU0FBUyxFQUNUO29CQUNJLG1CQUFtQixFQUFFLElBQUk7b0JBQ3pCLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCO29CQUMxRCxvQkFBb0IsRUFBRSxJQUFJO2lCQUM3QixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDdEIsSUFBSSxpQkFBTyxFQUFFO2FBQ2hCLENBQUM7UUFDTixDQUFDO0tBQ0o7SUF0Q0QsZ0NBc0NDIn0=