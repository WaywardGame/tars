define(["require", "exports", "../../../core/objective/IObjective", "../../../core/objective/Objective", "../../core/ExecuteActionForItem", "../../core/MoveToTarget", "../../core/Restart"], function (require, exports, IObjective_1, Objective_1, ExecuteActionForItem_1, MoveToTarget_1, Restart_1) {
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
                new ExecuteActionForItem_1.default(ExecuteActionForItem_1.ExecuteActionType.Doodad, itemTypes, {
                    onlyAllowHarvesting: true,
                    onlyGatherWithHands: context.options.harvestOnlyUseHands,
                }).setStatus(this),
                new Restart_1.default(),
            ];
        }
    }
    exports.default = HarvestDoodad;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFydmVzdERvb2RhZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9vYmplY3RpdmVzL290aGVyL2Rvb2RhZC9IYXJ2ZXN0RG9vZGFkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVVBLE1BQXFCLGFBQWMsU0FBUSxtQkFBUztRQUVoRCxZQUE2QixNQUFjO1lBQ3ZDLEtBQUssRUFBRSxDQUFDO1lBRGlCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFM0MsQ0FBQztRQUVNLGFBQWE7WUFDaEIsT0FBTyxpQkFBaUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFDLENBQUM7UUFFTSxTQUFTO1lBQ1osT0FBTyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQWdCO1lBQ2pDLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFbkQsTUFBTSxXQUFXLEdBQUcsWUFBWSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1lBQ25ILElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsT0FBTyw0QkFBZSxDQUFDLFVBQVUsQ0FBQzthQUNyQztZQUVELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFckQsT0FBTztnQkFDSCxJQUFJLHNCQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUM7Z0JBQ25DLElBQUksOEJBQW9CLENBQ3BCLHdDQUFpQixDQUFDLE1BQU0sRUFDeEIsU0FBUyxFQUNUO29CQUNJLG1CQUFtQixFQUFFLElBQUk7b0JBQ3pCLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUJBQW1CO2lCQUMzRCxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztnQkFDdEIsSUFBSSxpQkFBTyxFQUFFO2FBQ2hCLENBQUM7UUFDTixDQUFDO0tBQ0o7SUFwQ0QsZ0NBb0NDIn0=